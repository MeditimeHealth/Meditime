/**
 * export-db.js
 * ─────────────────────────────────────────────────────────────────
 * Exports the ENTIRE MongoDB database to a local JSON backup.
 *
 * Usage:
 *   node scripts/export-db.js
 *   node scripts/export-db.js --out ./my-backup   # custom output dir
 *
 * Output structure:
 *   db_backups/
 *     2026-06-15T20-38-00/
 *       _metadata.json          ← export info (date, db name, counts)
 *       doctors.json
 *       users.json
 *       ...
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

// ── Config ──────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Allow custom output dir via --out flag
const outFlagIdx = process.argv.indexOf('--out');
const BASE_DIR = outFlagIdx !== -1
  ? process.argv[outFlagIdx + 1]
  : path.resolve(__dirname, '..', 'db_backups');

// ── Helpers ─────────────────────────────────────────────────────────
function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── Main ────────────────────────────────────────────────────────────
async function exportDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();

    const db = client.db(); // uses the DB name from the URI
    const dbName = db.databaseName;
    console.log(`📦 Connected to database: ${dbName}\n`);

    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections
      .map(c => c.name)
      .filter(name => !name.startsWith('system.')) // skip system collections
      .sort();

    if (collectionNames.length === 0) {
      console.log('⚠️  No collections found in the database.');
      return;
    }

    console.log(`📋 Found ${collectionNames.length} collections:\n   ${collectionNames.join(', ')}\n`);

    // Create output directory
    const exportDir = path.join(BASE_DIR, timestamp());
    fs.mkdirSync(exportDir, { recursive: true });

    const metadata = {
      exportedAt: new Date().toISOString(),
      database: dbName,
      mongoUri: MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@'), // hide credentials
      collections: {},
      totalDocuments: 0,
      totalSizeBytes: 0,
    };

    // Export each collection
    for (const name of collectionNames) {
      process.stdout.write(`   ⏳ Exporting "${name}"...`);

      const docs = await db.collection(name).find({}).toArray();
      const json = JSON.stringify(docs, null, 2);
      const filePath = path.join(exportDir, `${name}.json`);

      fs.writeFileSync(filePath, json, 'utf-8');

      const sizeBytes = Buffer.byteLength(json, 'utf-8');
      metadata.collections[name] = {
        documentCount: docs.length,
        sizeBytes,
        sizeFormatted: formatBytes(sizeBytes),
      };
      metadata.totalDocuments += docs.length;
      metadata.totalSizeBytes += sizeBytes;

      console.log(` ✅ ${docs.length} docs (${formatBytes(sizeBytes)})`);
    }

    // Write metadata
    metadata.totalSizeFormatted = formatBytes(metadata.totalSizeBytes);
    fs.writeFileSync(
      path.join(exportDir, '_metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    // Summary
    console.log('\n' + '═'.repeat(55));
    console.log(`✅ Export complete!`);
    console.log(`   📂 Location:   ${exportDir}`);
    console.log(`   📊 Collections: ${collectionNames.length}`);
    console.log(`   📄 Documents:   ${metadata.totalDocuments}`);
    console.log(`   💾 Total size:  ${metadata.totalSizeFormatted}`);
    console.log('═'.repeat(55));
  } catch (err) {
    console.error('\n❌ Export failed:', err.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed.');
  }
}

exportDatabase();
