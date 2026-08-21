/**
 * httpOnly refresh cookie (works when frontend proxies /api to this server)
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { parse } from "cookie";
import type { CookieOptions, Request } from "express";

export const REFRESH_COOKIE_NAME = "illustriober_refresh";
export const CSRF_COOKIE_NAME = "illustriober_csrf";

export function readRequestCookie(req: Request, name: string): string | undefined {
  const cookieHeader = req.get("Cookie");
  if (!cookieHeader) return undefined;

  try {
    return parse(cookieHeader)[name];
  } catch {
    return undefined;
  }
}

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

export function csrfCookieOptions(): CookieOptions {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}

export function createCsrfToken(refreshToken: string): string {
  const nonce = randomBytes(32).toString("hex");
  const signature = createHmac("sha256", refreshToken).update(nonce).digest("hex");
  return `${nonce}.${signature}`;
}

export function verifyCsrfToken(refreshToken: string, token: string): boolean {
  const [nonce, suppliedSignature, ...remainder] = token.split(".");
  if (!nonce || !suppliedSignature || remainder.length > 0) return false;

  const expectedSignature = createHmac("sha256", refreshToken).update(nonce).digest("hex");
  const supplied = Buffer.from(suppliedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
