// Second pass: fix remaining departments
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const S = new mongoose.Schema({ name: String, nameBn: String, image: String }, { timestamps: true });
const D = mongoose.model('Dept', S, 'departments');

// Remaining Bangla-only departments -> English
const banglaFixes = {
  "চর্ম ও যৌনরোগ": "Dermatology & Venereology",
  "চেস্ট/থোরাসিক সার্জারি": "Chest/Thoracic Surgery",
  "জেনারেল ও ল্যাপারোস্কোপিক সার্জারি": "General & Laparoscopic Surgery",
  "ডায়াবেটিস": "Diabetes",
  "থাইরয়েড ও হরমোন": "Thyroid & Hormone Specialist",
  "নবজাতক ও শিশুরোগ": "Neonatal & Pediatrics",
  "নিউরোমেডিসিন ও সার্জারি": "Neuro-Medicine & Surgery",
  "পেইন মেডিসিন ও বাত-ব্যথা": "Pain Medicine & Rheumatology",
  "বক্ষব্যাধী ও অ্যাজমা": "Chest Diseases & Asthma",
  "বার্ণ প্লাস্টিক এন্ড রিকনস্ট্রাক্টিভ সার্জারি": "Burn, Plastic & Reconstructive Surgery",
  "মনোরোগ ও সাইকোথেরাপিস্ট": "Psychiatrist and psychotherapist",
  "মূত্রনালী ও কিডনি রোগ": "Urology & Nephrology",
  "রক্তরোগ ও মেডিসিন": "Hematology & Medicine",
  "স্ত্রীরোগ ও প্রসূতিবিদ্যা": "Gynecology & Obstetrics",
  "হৃদরোগ ও মেডিসিন": "Cardiology & Medicine",
  "হেপাটো-বিলিয়ারি ও লিভার ট্রান্সপ্ল্যান্ট সার্জারি": "Hepato-Biliary & Liver Transplant Surgery",
};

// Remaining English-only departments -> Bangla
const englishFixes = {
  "Burn, Plastic & Reconstructive Surgery": "বার্ণ প্লাস্টিক এন্ড রিকনস্ট্রাক্টিভ সার্জারি",
  "Cancer Specialist / Oncology": "ক্যান্সার বিশেষজ্ঞ / অনকোলজি",
  "Cardiology & Medicine": "হৃদরোগ ও মেডিসিন",
  "Chest Diseases & Asthma": "বক্ষব্যাধী ও অ্যাজমা",
  "Chest/Thoracic Surgery": "চেস্ট/থোরাসিক সার্জারি",
  "Dermatology & Venereology": "চর্ম ও যৌনরোগ",
  "Diabetes": "ডায়াবেটিস",
  "Food & Nutrition": "খাদ্য ও পুষ্টি",
  "Gastro-Liver Diseases": "গ্যাস্ট্রো-লিভার রোগ",
  "General & Laparoscopic Surgery": "জেনারেল ও ল্যাপারোস্কোপিক সার্জারি",
  "Hematology & Medicine": "রক্তরোগ ও মেডিসিন",
  "Hepato-Biliary & Liver Transplant Surgery": "হেপাটো-বিলিয়ারি ও লিভার ট্রান্সপ্ল্যান্ট সার্জারি",
};

function isBangla(str) {
  return /[\u0980-\u09FF]/.test(str);
}

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const fs = require('fs');
  const log = [];

  const depts = await D.find({});

  for (const dept of depts) {
    // Fix Bangla-only (Bangla in name field, no nameBn)
    if (dept.name && isBangla(dept.name) && !dept.nameBn) {
      const englishName = banglaFixes[dept.name];
      if (englishName) {
        // Check if English version already exists
        const existing = await D.findOne({ name: englishName, _id: { $ne: dept._id } });
        if (existing) {
          // Merge into existing
          if (!existing.nameBn) {
            await D.updateOne({ _id: existing._id }, { $set: { nameBn: dept.name } });
          }
          await D.deleteOne({ _id: dept._id });
          log.push(`MERGE+DELETE: "${dept.name}" -> merged into "${englishName}"`);
        } else {
          await D.updateOne({ _id: dept._id }, { $set: { name: englishName, nameBn: dept.name } });
          log.push(`FIX: "${dept.name}" -> name="${englishName}", nameBn="${dept.name}"`);
        }
      } else {
        log.push(`SKIP: "${dept.name}" (no English mapping)`);
      }
    }
    // Fix English-only (no nameBn)
    else if (dept.name && !isBangla(dept.name) && !dept.nameBn) {
      const banglaName = englishFixes[dept.name];
      if (banglaName) {
        await D.updateOne({ _id: dept._id }, { $set: { nameBn: banglaName } });
        log.push(`ADD nameBn: "${dept.name}" -> "${banglaName}"`);
      } else {
        log.push(`SKIP: "${dept.name}" (no Bangla mapping)`);
      }
    }
    else {
      log.push(`OK: "${dept.name}" / "${dept.nameBn || '(none)'}"`);
    }
  }

  // Final output
  const finalDepts = await D.find({}).sort({ name: 1 }).lean();
  const finalLines = finalDepts.map(d => {
    const ok = (d.name && d.nameBn && !isBangla(d.name)) ? 'OK' : 'NEEDS_FIX';
    return `${ok}: ${d.name} | ${d.nameBn || '(none)'}`;
  });

  fs.writeFileSync('scripts/dept_result.txt', 
    '=== LOG ===\n' + log.join('\n') + '\n\n=== FINAL (' + finalDepts.length + ' departments) ===\n' + finalLines.join('\n'), 
    'utf8'
  );
  
  console.log('Done! Check scripts/dept_result.txt');
  console.log(`Total: ${finalDepts.length} departments`);
  await mongoose.disconnect();
}

fix().catch(console.error);
