export const ACCESS_TOKEN_COOKIE = "scoresprint_access_token";
export const REFRESH_TOKEN_COOKIE = "scoresprint_refresh_token";

export const baseAuthCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/"
};
