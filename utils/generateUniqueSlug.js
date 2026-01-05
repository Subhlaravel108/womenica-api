import slugify from 'slugify';

export const generateUniqueSlug = async (title, collection) => {
  const cleanTitle = title
    .replace(/\|/g, ' ')
    .replace(/&/g, ' ');

  let baseSlug = slugify(cleanTitle, {
    lower: true,
    strict: true
  });

  baseSlug = baseSlug.slice(0, 300).replace(/^-+|-+$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (await collection.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};


