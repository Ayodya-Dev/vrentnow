/**
 * Web and admin both run on localhost with different ports. Browsers scope
 * cookies by host, not port — so a shared Auth.js session cookie means logging
 * into admin also signs you into the customer site (and vice versa).
 *
 * Only the session cookie must be unique. CSRF/callback keep Auth.js defaults
 * (still fine: CSRF is fetched per-app from /api/auth/csrf).
 */
export const AUTH_COOKIE_PREFIX = "vrentnow-web";

export function sessionCookieName(secure: boolean): string {
  return `${secure ? "__Secure-" : ""}${AUTH_COOKIE_PREFIX}.session-token`;
}

export function authCookieConfig() {
  const secure = (process.env.AUTH_URL ?? "").startsWith("https://");
  const prefix = secure ? "__Secure-" : "";

  return {
    sessionToken: {
      name: `${prefix}${AUTH_COOKIE_PREFIX}.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure,
      },
    },
  };
}
