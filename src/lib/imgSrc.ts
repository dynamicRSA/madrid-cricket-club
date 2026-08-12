/**
 * Returns the correct image path including the basePath for GitHub Pages.
 * Next.js <Image> components handle this automatically only when NOT unoptimized
 * and NOT using fill+src combo on static exports.
 * Plain <img> tags always need this prefix.
 */
const basePath =
  process.env.NODE_ENV === "production" ? "/madrid-cricket-club" : "";

export function imgSrc(path: string): string {
  // External URLs — pass through unchanged
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Already prefixed
  if (path.startsWith(basePath + "/")) return path;
  return `${basePath}${path}`;
}
