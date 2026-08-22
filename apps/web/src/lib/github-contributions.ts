const GITHUB_USER = "Itsriober";
const CONTRIBUTION_CACHE_SECONDS = 21_600;

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ContributionDay = {
  count: number;
  date: string;
  level: ContributionLevel;
};

export type ContributionSnapshot = {
  activeDays: number;
  busiestDay: ContributionDay | null;
  currentStreak: number;
  days: ContributionDay[];
  endDate: string;
  last30Days: number;
  longestStreak: number;
  startDate: string;
  total: number;
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + amount);
  return nextDate;
}

function calculateStreaks(days: ContributionDay[]) {
  let longestStreak = 0;
  let runningStreak = 0;

  for (const day of days) {
    if (day.count > 0) {
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  return { currentStreak: runningStreak, longestStreak };
}

export function parseContributionCalendar(html: string): ContributionDay[] {
  const days: ContributionDay[] = [];
  const cellPattern =
    /<td\b[^>]*\bclass="[^"]*\bContributionCalendar-day\b[^"]*"[^>]*><\/td>\s*<tool-tip\b[^>]*>([^<]*)<\/tool-tip>/g;

  for (const match of html.matchAll(cellPattern)) {
    const cell = match[0];
    const date = cell.match(/\bdata-date="([^"]+)"/)?.[1];
    const levelValue = cell.match(/\bdata-level="([0-4])"/)?.[1];
    const countValue = match[1].match(/([\d,]+) contributions?\b/i)?.[1];

    if (!date || levelValue === undefined) continue;

    days.push({
      count: countValue ? Number(countValue.replaceAll(",", "")) : 0,
      date,
      level: Number(levelValue) as ContributionLevel,
    });
  }

  return days;
}

export function buildContributionSnapshot(
  contributionDays: ContributionDay[],
  referenceDate = new Date(),
): ContributionSnapshot {
  const end = new Date(referenceDate);
  end.setUTCHours(0, 0, 0, 0);
  const start = addUtcDays(end, -364);
  const contributionByDate = new Map(
    contributionDays.map((day) => [day.date, day] as const),
  );
  const days: ContributionDay[] = [];

  for (let cursor = start; cursor <= end; cursor = addUtcDays(cursor, 1)) {
    const date = toDateKey(cursor);
    days.push(
      contributionByDate.get(date) ?? { count: 0, date, level: 0 },
    );
  }

  const total = days.reduce((sum, day) => sum + day.count, 0);
  const last30Days = days
    .slice(-30)
    .reduce((sum, day) => sum + day.count, 0);
  const activeDays = days.filter((day) => day.count > 0).length;
  const busiestDay = days.reduce<ContributionDay | null>(
    (busiest, day) => (!busiest || day.count > busiest.count ? day : busiest),
    null,
  );
  const { currentStreak, longestStreak } = calculateStreaks(days);

  return {
    activeDays,
    busiestDay: busiestDay?.count ? busiestDay : null,
    currentStreak,
    days,
    endDate: toDateKey(end),
    last30Days,
    longestStreak,
    startDate: toDateKey(start),
    total,
  };
}

export async function getGitHubContributionSnapshot(): Promise<ContributionSnapshot | null> {
  const referenceDate = new Date();
  const startDate = addUtcDays(referenceDate, -364);
  const years = Array.from(
    new Set([startDate.getUTCFullYear(), referenceDate.getUTCFullYear()]),
  );

  try {
    const responses = await Promise.all(
      years.map((year) =>
        fetch(
          `https://github.com/users/${GITHUB_USER}/contributions?from=${year}-01-01&to=${year}-12-31`,
          {
            headers: { "User-Agent": "Illustriober-Creatives-Website" },
            next: {
              revalidate: CONTRIBUTION_CACHE_SECONDS,
              tags: ["github-contributions"],
            },
          },
        ),
      ),
    );

    if (responses.some((response) => !response.ok)) return null;

    const calendars = await Promise.all(
      responses.map((response) => response.text()),
    );
    const contributionDays = calendars.flatMap(parseContributionCalendar);

    if (contributionDays.length === 0) return null;

    return buildContributionSnapshot(contributionDays, referenceDate);
  } catch {
    return null;
  }
}
