import slugify from 'slugify';

export const generateUniqueSlug = async (title, collection) => {
  const baseSlug =
    slugify(title, { lower: true, strict: true }).slice(0, 120) || 'item';

  let slug = baseSlug;
  let counter = 1;

  while (await collection.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};
