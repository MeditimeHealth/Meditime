import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Doctor from '@/models/Doctor';

// Simple Levenshtein distance for string similarity
function levenshteinSimilarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const al = a.toLowerCase().trim();
  const bl = b.toLowerCase().trim();
  if (al === bl) return 1;
  const len = Math.max(al.length, bl.length);
  if (len === 0) return 1;
  
  const matrix: number[][] = [];
  for (let i = 0; i <= al.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= al.length; i++) {
    for (let j = 1; j <= bl.length; j++) {
      const cost = al[i - 1] === bl[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return 1 - matrix[al.length][bl.length] / len;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name, designation, specialty, qualification, excludeId } = await request.json();
    
    if (!name && !designation && !specialty && !qualification) {
      return NextResponse.json({ matches: [] });
    }

    // Build a broad query to find potential matches
    const orConditions: any[] = [];
    if (name) orConditions.push({ name: { $regex: name.split(' ')[0], $options: 'i' } });
    if (name) orConditions.push({ nameBn: { $regex: name.split(' ')[0], $options: 'i' } });
    if (specialty) orConditions.push({ specialty: { $regex: specialty.split(' ')[0], $options: 'i' } });
    if (qualification) orConditions.push({ qualification: { $regex: qualification.split(' ')[0], $options: 'i' } });
    
    if (orConditions.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const query: any = { $or: orConditions };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const candidates = await Doctor.find(query)
      .select('name nameBn specialty specialtyBn qualification qualificationBn designation designationBn slug _id')
      .limit(50)
      .lean();

    const matches = candidates
      .map((doc: any) => {
        const fields = [
          { weight: 0.3, score: Math.max(
            levenshteinSimilarity(name || '', doc.name || ''),
            levenshteinSimilarity(name || '', doc.nameBn || '')
          )},
          { weight: 0.25, score: Math.max(
            levenshteinSimilarity(designation || '', doc.designation || ''),
            levenshteinSimilarity(designation || '', doc.designationBn || '')
          )},
          { weight: 0.25, score: Math.max(
            levenshteinSimilarity(specialty || '', doc.specialty || ''),
            levenshteinSimilarity(specialty || '', doc.specialtyBn || '')
          )},
          { weight: 0.2, score: Math.max(
            levenshteinSimilarity(qualification || '', doc.qualification || ''),
            levenshteinSimilarity(qualification || '', doc.qualificationBn || '')
          )},
        ];
        const similarity = fields.reduce((sum, f) => sum + f.weight * f.score, 0);
        return {
          _id: doc._id,
          name: doc.name,
          nameBn: doc.nameBn,
          specialty: doc.specialty,
          specialtyBn: doc.specialtyBn,
          qualification: doc.qualification,
          qualificationBn: doc.qualificationBn,
          designation: doc.designation,
          designationBn: doc.designationBn,
          slug: doc.slug,
          similarity: Math.round(similarity * 100),
        };
      })
      .filter((m: any) => m.similarity >= 80)
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, 5);

    return NextResponse.json({ matches });
  } catch (error: any) {
    console.error('Error checking duplicate doctors:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
