import type { NextFunction, Request, Response } from "express";
import {
  CSRF_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  readRequestCookie,
  verifyCsrfToken,
} from "../lib/cookies";
import { isAllowedOrigin } from "../lib/origins";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const REQUESTED_WITH_VALUE = "Illustriober-Web";

function requestOrigin(req: Request): string | null {
  const origin = req.get("Origin");
  if (origin) return origin;

  const referer = req.get("Referer");
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return "invalid";
  }
}

/**
 * Protect cookie-authenticated mutations with browser-intent, origin, and a
 * signed double-submit token bound to the current refresh session.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  if (req.get("X-Requested-With") !== REQUESTED_WITH_VALUE) {
    res.status(403).json({ success: false, error: "Invalid request origin" });
    return;
  }

  if (req.get("Sec-Fetch-Site") === "cross-site") {
    res.status(403).json({ success: false, error: "Cross-site request blocked" });
    return;
  }

  const origin = requestOrigin(req);
  if (origin && !isAllowedOrigin(origin)) {
    res.status(403).json({ success: false, error: "Request origin is not allowed" });
    return;
  }

  const refreshToken = readRequestCookie(req, REFRESH_COOKIE_NAME);
  if (!refreshToken) {
    next();
    return;
  }

  const cookieToken = readRequestCookie(req, CSRF_COOKIE_NAME);
  // Sessions issued before CSRF cookies were introduced remain protected by
  // the custom-header and origin checks above. Their next rotation upgrades
  // them to the signed double-submit token automatically.
  if (!cookieToken) {
    next();
    return;
  }

  const headerToken = req.get("X-CSRF-Token");

  if (
    !headerToken ||
    headerToken !== cookieToken ||
    !verifyCsrfToken(refreshToken, cookieToken)
  ) {
    res.status(403).json({ success: false, error: "Invalid CSRF token" });
    return;
  }

  next();
}
