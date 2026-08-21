/**
 * Returns the correct image path.
 * Previously prefixed paths with /madrid-cricket-club for GitHub Pages subdirectory.
 * Now the site is served from the root of madridcricketclub.com, so no prefix needed.
 */
export function imgSrc(path: string): string {
  // External URLs — pass through unchanged
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return path;
}
