import { describe, expect, it } from "vitest";
import {
  buildContributionSnapshot,
  parseContributionCalendar,
} from "./github-contributions";

describe("parseContributionCalendar", () => {
  it("reads GitHub contribution counts and intensity levels", () => {
    const html = `
      <td data-date="2026-08-20" id="day-1" data-level="3" class="ContributionCalendar-day"></td>
      <tool-tip for="day-1">12 contributions on August 20th.</tool-tip>
      <td data-date="2026-08-21" id="day-2" data-level="0" class="ContributionCalendar-day"></td>
      <tool-tip for="day-2">No contributions on August 21st.</tool-tip>
    `;

    expect(parseContributionCalendar(html)).toEqual([
      { count: 12, date: "2026-08-20", level: 3 },
      { count: 0, date: "2026-08-21", level: 0 },
    ]);
  });
});

describe("buildContributionSnapshot", () => {
  it("summarises a rolling year of daily contributions", () => {
    const snapshot = buildContributionSnapshot(
      [
        { count: 2, date: "2026-08-17", level: 1 },
        { count: 5, date: "2026-08-18", level: 2 },
        { count: 8, date: "2026-08-19", level: 4 },
        { count: 0, date: "2026-08-20", level: 0 },
        { count: 3, date: "2026-08-21", level: 1 },
      ],
      new Date("2026-08-21T12:00:00.000Z"),
    );

    expect(snapshot.days).toHaveLength(365);
    expect(snapshot.total).toBe(18);
    expect(snapshot.last30Days).toBe(18);
    expect(snapshot.activeDays).toBe(4);
    expect(snapshot.longestStreak).toBe(3);
    expect(snapshot.currentStreak).toBe(1);
    expect(snapshot.busiestDay).toMatchObject({
      count: 8,
      date: "2026-08-19",
    });
  });
});
