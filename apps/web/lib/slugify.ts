import slugify from 'slugify';

const slugifyOptions = {
  replacement: '-', // replace spaces with replacement character, defaults to `-`
  remove: undefined, // remove characters that match regex, defaults to `undefined`
  lower: true, // convert to lower case, defaults to `false`
  strict: true, // strip special characters except replacement, defaults to `false`
  locale: 'en', // language code of the locale to use
  trim: true, // trim leading and trailing replacement chars, defaults to `true`
};

export function slugifySafe(input: string) {
  return slugify(input, slugifyOptions);
}

/**
 * Normalizes an action string to slug format: lowercase, trimmed, only letters, digits, hyphens and plus.
 * Replaces spaces and other invalid characters with a single dash; collapses multiple dashes.
 */
export function slugifyAction(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
