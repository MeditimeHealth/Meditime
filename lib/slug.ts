import { slugify } from "./utils";
import { Model } from "mongoose";

export async function generateUniqueSlug(
  name: string,
  model: Model<any>,
  excludeId?: string,
  /** The field to check for uniqueness. Defaults to "slug". */
  field: string = "slug"
) {
  let baseSlug = slugify(name);
  if (!baseSlug) baseSlug = field === "slugBn" ? "doctor" : "doctor";

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query: any = { [field]: slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await model.findOne(query);
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}
