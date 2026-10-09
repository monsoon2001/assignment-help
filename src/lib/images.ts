const ALLOWED_AVATAR_HOST_RE = /(^|\.)(googleusercontent\.com|ggpht\.com|images\.unsplash\.com)$/;

export function isSafeRemoteUrl(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && ALLOWED_AVATAR_HOST_RE.test(url.hostname);
  } catch {
    return false;
  }
}