export function getPublicAppBaseUrl(): string | null {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/+$/, "");

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return null;
}

export function toAbsoluteAppUrl(pathOrUrl: string): string {
  const value = (pathOrUrl || "").trim();
  if (!value) return value;

  // If already absolute, keep as-is (normalized).
  try {
    return new URL(value).toString();
  } catch {
    // fall through
  }

  const base = getPublicAppBaseUrl();
  if (!base) return value;

  // Support both "/path" and "path".
  const relative = value.startsWith("/") ? value : `/${value}`;
  return new URL(relative, base).toString();
}
