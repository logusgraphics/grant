/**
 * Adds a cache-busting query parameter to an image URL based on a timestamp
 * @param url - The image URL
 * @param timestamp - Optional timestamp to use for cache-busting (defaults to current time)
 * @returns The URL with a cache-busting query parameter
 */
export function addImageCacheBuster(
  url: string | null | undefined,
  timestamp?: string | Date | null
): string | undefined {
  if (!url) {
    return undefined;
  }

  const cacheBuster = timestamp
    ? typeof timestamp === 'string'
      ? new Date(timestamp).getTime()
      : timestamp.getTime()
    : Date.now();

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${cacheBuster}`;
}
