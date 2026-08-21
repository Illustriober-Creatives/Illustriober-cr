import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimitStore } from "../middleware/rateLimit";

const emailMock = vi.hoisted(() => ({ sendStaceyResponseEmail: vi.fn() }));
const prismaMock = vi.hoisted(() => ({}));
vi.mock("../lib/email", () => emailMock);
vi.mock("../lib/prisma", () => ({ default: prismaMock, prisma: prismaMock }));

import app from "../app";

const validResponse = {
  activity: "date-and-movie",
  preferredDate: "2026-08-28",
  timeOfDay: "evening",
  foodDrink: "Sushi",
  movieTitle: "Zootopia 2",
  movieShowtime: "6:00 pm",
  snacks: ["Sweet popcorn", "Chocolate"],
  perfectNote: "Somewhere cosy, please.",
};

describe("stacey response route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
    emailMock.sendStaceyResponseEmail.mockResolvedValue({ success: true });
  });

  it("delivers a valid response without storing it", async () => {
    const response = await request(app).post("/api/stacey-response").send(validResponse);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ success: true });
    expect(emailMock.sendStaceyResponseEmail).toHaveBeenCalledWith(validResponse);
  });

  it("rejects malformed submissions", async () => {
    const response = await request(app).post("/api/stacey-response").send({ ...validResponse, preferredDate: "2026-99-99" });
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Validation failed");
  });

  it("returns a retryable error when Resend is unavailable", async () => {
    emailMock.sendStaceyResponseEmail.mockResolvedValue({ success: false, error: "Email service not configured" });
    const response = await request(app).post("/api/stacey-response").send(validResponse);
    expect(response.status).toBe(503);
    expect(response.body.error).toContain("couldn't send");
  });
});
