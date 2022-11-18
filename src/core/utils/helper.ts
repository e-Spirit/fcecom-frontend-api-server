/**
 * Removes a strings trailing slash if present
 */
export const removeTrailingSlash = (string: string): string => {
  return string.replace(/\/+$/, '');
};
