const LOCAL_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const VERCEL_PREVIEW_REGEX = /^https:\/\/[\w-]+\.vercel\.app$/i;

const defaultOrigins = new Set<string>([
  "http://localhost:3000",
  "http://localhost:3001",
  "https://illustriober.com",
  "https://www.illustriober.com",
]);

export function isAllowedOrigin(origin: string): boolean {
  if (origin === "null") {
    return process.env.NODE_ENV !== "production";
  }

  const configuredOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((configuredOrigin) => configuredOrigin.trim())
    .filter(Boolean);

  return (
    defaultOrigins.has(origin) ||
    configuredOrigins.includes(origin) ||
    LOCAL_ORIGIN_REGEX.test(origin) ||
    VERCEL_PREVIEW_REGEX.test(origin)
  );
}
