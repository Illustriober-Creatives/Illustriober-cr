/**
 * Access JWT signing and verification
 */

import jwt from "jsonwebtoken";

const ACCESS_EXPIRES_IN = "15m";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }
  return secret || "dev-only-insecure-jwt-secret-change-me";
}

export type AccessTokenPayload = {
  sub: string;
  role: string;
  email: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(
    { role: payload.role, email: payload.email },
    getSecret(),
    {
      subject: payload.sub,
      expiresIn: ACCESS_EXPIRES_IN,
    }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getSecret()) as jwt.JwtPayload & {
    role?: string;
    email?: string;
  };
  const sub = decoded.sub;
  if (!sub || typeof decoded.role !== "string" || typeof decoded.email !== "string") {
    throw new Error("Invalid access token payload");
  }
  return { sub, role: decoded.role, email: decoded.email };
}
