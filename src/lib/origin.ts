export const BRAND_HOST = "https://vera.fr";

export function requestOrigin(request?: Request | null): string {
  if (!request) return BRAND_HOST;
  try {
    const u = new URL(request.url);
    const host = request.headers.get("x-forwarded-host") ?? u.host;
    const proto = request.headers.get("x-forwarded-proto") ?? u.protocol.replace(":", "");
    if (!host || host.startsWith("127.") || host.startsWith("localhost")) return BRAND_HOST;
    return `${proto}://${host}`;
  } catch {
    return BRAND_HOST;
  }
}
