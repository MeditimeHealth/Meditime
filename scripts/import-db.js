/**
 * import-db.js
 * ─────────────────────────────────────────────────────────────────
 * Imports/pushes a full database backup into MongoDB.
 * Works with backups created by export-db.js.
 *
 * Usage:
 *   node scripts/import-db.js                                      # imports latest backup from db_backups/
 *   node scripts/import-db.js --dir ./db_backups/2026-06-15T20-38  # import a specific backup
 *   node scripts/import-db.js --drop                               # drop existing collections before import
 *   node scripts/import-db.js --dir ./my-backup --drop             # combine flags
 *
 * Flags:
 *   --dir <path>   Path to the backup folder (containing *.json files)
 *   --drop         Drop each collection before inserting (full overwrite)
 *                  Without --drop, documents are ADDED (upserted by _id)
 */

const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

// ── Config ──────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
const DROP_MODE = args.includes('--drop');

function getBackupDir() {
  const dirFlagIdx = args.indexOf('--dir');
  if (dirFlagIdx !== -1 && args[dirFlagIdx + 1]) {
    const dir = path.resolve(args[dirFlagIdx + 1]);
    if (!fs.existsSync(dir)) {
      console.error(`❌ Backup directory not found: ${dir}`);
      process.exit(1);
    }
    return dir;
  }

  // Auto-find latest backup
  const backupsRoot = path.resolve(__dirname, '..', 'db_backups');
  if (!fs.existsSync(backupsRoot)) {
    console.error(`❌ No db_backups/ directory found. Run export-db.js first.`);
    process.exit(1);
  }

  const subdirs = fs.readdirSync(backupsRoot)
    .filter(d => fs.statSync(path.join(backupsRoot, d)).isDirectory())
    .sort()
    .reverse();

  if (subdirs.length === 0) {
    console.error(`❌ No backup folders found inside db_backups/`);
    process.exit(1);
  }

  return path.join(backupsRoot, subdirs[0]);
}

// ── Helpers ─────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Recursively restores MongoDB-specific types from plain JSON.
 * - Converts { "$oid": "..." } back to ObjectId
 * - Converts { "$date": "..." } back to Date
 * - Converts string _id fields to ObjectId
 */
function restoreMongoTypes(obj) {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(restoreMongoTypes);
  }

  if (typeof obj === 'object') {
    // Handle extended JSON $oid
    if (obj.$oid && typeof obj.$oid === 'string') {
      try { return new ObjectId(obj.$oid); } catch { return obj.$oid; }
    }

    // Handle extended JSON $date
    if (obj.$date && typeof obj.$date === 'string') {
      return new Date(obj.$date);
    }

    const restored = {};
    for (const [key, value] of Object.entries(obj)) {
      restored[key] = restoreMongoTypes(value);
    }
    return restored;
  }

  return obj;
}

// ── Main ────────────────────────────────────────────────────────────
async function importDatabase() {
  const backupDir = getBackupDir();

  // Discover JSON files (skip _metadata.json)
  const jsonFiles = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.json') && f !== '_metadata.json')
    .sort();

  if (jsonFiles.length === 0) {
    console.error(`❌ No JSON files found in: ${backupDir}`);
    process.exit(1);
  }

  console.log(`📂 Backup directory: ${backupDir}`);
  console.log(`📋 Found ${jsonFiles.length} collection files: ${jsonFiles.map(f => f.replace('.json', '')).join(', ')}`);
  console.log(`⚙️  Mode: ${DROP_MODE ? '🔴 DROP & INSERT (full overwrite)' : '🟢 UPSERT (merge by _id)'}\n`);

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();

    const db = client.db();
    const dbName = db.databaseName;
    console.log(`📦 Target database: ${dbName}\n`);

    let totalInserted = 0;
    let totalUpserted = 0;
    let totalSkipped = 0;

    for (const file of jsonFiles) {
      const collectionName = file.replace('.json', '');
      const filePath = path.join(backupDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const fileSize = Buffer.byteLength(raw, 'utf-8');

      let docs;
      try {
        docs = JSON.parse(raw);
      } catch (e) {
        console.log(`   ⚠️  Skipping "${collectionName}" — invalid JSON`);
        totalSkipped++;
        continue;
      }

      if (!Array.isArray(docs)) {
        console.log(`   ⚠️  Skipping "${collectionName}" — expected an array`);
        totalSkipped++;
        continue;
      }

      if (docs.length === 0) {
        console.log(`   ⏭️  Skipping "${collectionName}" — empty array`);
        totalSkipped++;
        continue;
      }

      // Restore MongoDB types (ObjectId, Date, etc.)
      docs = docs.map(restoreMongoTypes);

      process.stdout.write(`   ⏳ Importing "${collectionName}" (${docs.length} docs, ${formatBytes(fileSize)})...`);

      const collection = db.collection(collectionName);

      if (DROP_MODE) {
        // Drop and insert fresh
        await collection.drop().catch(() => {}); // ignore if doesn't exist
        await collection.insertMany(docs, { ordered: false });
        totalInserted += docs.length;
        console.log(` ✅ Dropped & inserted ${docs.length} docs`);
      } else {
        // Upsert by _id — safe merge
        let upsertCount = 0;
        let insertCount = 0;

        const bulkOps = docs.map(doc => {
          if (doc._id) {
            return {
              replaceOne: {
                filter: { _id: doc._id },
                replacement: doc,
                upsert: true,
              },
            };
          } else {
            return {
              insertOne: { document: doc },
            };
          }
        });

        // Execute in batches of 500 to avoid memory issues
        const BATCH_SIZE = 500;
        for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
          const batch = bulkOps.slice(i, i + BATCH_SIZE);
          const result = await collection.bulkWrite(batch, { ordered: false });
          upsertCount += (result.upsertedCount || 0);
          insertCount += (result.insertedCount || 0);
        }

        totalUpserted += upsertCount;
        totalInserted += insertCount;
        console.log(` ✅ ${insertCount} inserted, ${upsertCount} upserted`);
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(55));
    console.log(`✅ Import complete!`);
    console.log(`   📦 Database:    ${dbName}`);
    console.log(`   📋 Collections: ${jsonFiles.length - totalSkipped}`);
    if (DROP_MODE) {
      console.log(`   📄 Inserted:    ${totalInserted} documents`);
    } else {
      console.log(`   📄 Inserted:    ${totalInserted} documents`);
      console.log(`   🔄 Upserted:    ${totalUpserted} documents`);
    }
    if (totalSkipped > 0) {
      console.log(`   ⏭️  Skipped:     ${totalSkipped} collections`);
    }
    console.log('═'.repeat(55));
  } catch (err) {
    console.error('\n❌ Import failed:', err.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed.');
  }
}

importDatabase();
