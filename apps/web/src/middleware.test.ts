import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

function makeRequest(path: string, cookies?: Record<string, string>) {
  const cookieHeader = cookies
    ? Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ")
    : undefined;

  return new NextRequest(`http://localhost${path}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
}

describe("middleware — protected routes", () => {
  it("redirects unauthenticated requests to /dashboard to /login", () => {
    const req = makeRequest("/dashboard");
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("preserves the original path as ?from= on redirect", () => {
    const req = makeRequest("/dashboard/projects");
    const res = middleware(req);
    expect(res.headers.get("location")).toContain("from=%2Fdashboard%2Fprojects");
  });

  it("allows authenticated requests to /dashboard through", () => {
    const req = makeRequest("/dashboard", { illustriober_refresh: "token123" });
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it("redirects unauthenticated requests to /admin to /login", () => {
    const req = makeRequest("/admin");
    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  it("allows authenticated requests to /admin through", () => {
    const req = makeRequest("/admin/enquiries", { illustriober_refresh: "token123" });
    const res = middleware(req);
    expect(res.status).toBe(200);
  });
});
