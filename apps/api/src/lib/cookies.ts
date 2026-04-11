/**
 * httpOnly refresh cookie (works when frontend proxies /api to this server)
 */

import type { CookieOptions } from "express";

export const REFRESH_COOKIE_NAME = "illustriober_refresh";

export function refreshCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "lax" : "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}
