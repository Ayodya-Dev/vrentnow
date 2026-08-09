import { AUTH_COOKIE_PREFIX, sessionCookieName } from "@/lib/auth-cookies";

const SECURE_SESSION_COOKIE = sessionCookieName(true);
const SESSION_COOKIE = sessionCookieName(false);

/** The slice of NextRequest that secure-cookie detection needs. */
export interface SecureCookieRequest {
  cookies: { has(name: string): boolean };
  headers: Headers;
  nextUrl: { protocol: string };
}

/**
 * Decide whether Auth.js issued the session cookie in "secure" mode
 * (`__Secure-` prefix), which `getToken()` needs to know so it derives the
 * matching cookie name AND decryption salt.
 */
export function usesSecureCookies(req: SecureCookieRequest): boolean {
  if (req.cookies.has(SECURE_SESSION_COOKIE)) return true;
  if (req.cookies.has(SESSION_COOKIE)) return false;
  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedProto) return forwardedProto.split(",")[0]?.trim() === "https";
  return req.nextUrl.protocol === "https:";
}

export function sessionTokenCookieName(req: SecureCookieRequest): string {
  return sessionCookieName(usesSecureCookies(req));
}

export { AUTH_COOKIE_PREFIX };
