import Doctor from "@/models/Doctor";
import { slugify } from "./utils";

export async function generateUniqueSlug(name: string, doctorId?: string) {
  let baseSlug = slugify(name);
  if (!baseSlug) baseSlug = 'doctor';
  
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const query: any = { slug };
    if (doctorId) query._id = { $ne: doctorId };
    const existing = await Doctor.findOne(query);
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}
