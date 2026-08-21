import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  CircleDot,
  GitBranch,
  GitCommitHorizontal,
  Github,
  GitPullRequest,
  MessageSquareText,
  PackageOpen,
  Star,
} from "lucide-react";
import {
  getGitHubContributionSnapshot,
  type ContributionDay,
  type ContributionSnapshot,
} from "@/lib/github-contributions";

const GITHUB_ORG = "Illustriober-Creatives";
const GITHUB_ORG_URL = `https://github.com/${GITHUB_ORG}`;
const GITHUB_USER = "Itsriober";
const GITHUB_USER_URL = `https://github.com/${GITHUB_USER}`;

type GitHubEvent = {
  id: string;
  type: string;
  actor: { login: string };
  repo: { name: string };
  created_at: string;
  payload: {
    action?: string;
    ref?: string;
    ref_type?: string;
    head?: string;
    pull_request?: { html_url?: string; number?: number };
    issue?: { html_url?: string; number?: number };
    comment?: { html_url?: string };
    review?: { html_url?: string };
    release?: { html_url?: string; name?: string; tag_name?: string };
  };
};

type ActivityDetails = {
  Icon: LucideIcon;
  label: string;
  url: string;
};

type ActivityItem = ActivityDetails & {
  actor: string;
  createdAt: string;
  id: string;
  repository: string;
};

function capitalize(value?: string) {
  if (!value) return "Updated";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function eventUrl(event: GitHubEvent) {
  const repositoryUrl = `https://github.com/${event.repo.name}`;
  const linkedUrl =
    event.payload.pull_request?.html_url ??
    event.payload.issue?.html_url ??
    event.payload.comment?.html_url ??
    event.payload.review?.html_url ??
    event.payload.release?.html_url;

  if (linkedUrl) return linkedUrl;
  if (event.type === "PushEvent" && event.payload.head) {
    return `${repositoryUrl}/commit/${event.payload.head}`;
  }
  return repositoryUrl;
}

function describeEvent(event: GitHubEvent): ActivityDetails {
  const url = eventUrl(event);

  switch (event.type) {
    case "PushEvent": {
      const branch = event.payload.ref?.replace("refs/heads/", "");
      return {
        Icon: GitCommitHorizontal,
        label:
          branch === "main"
            ? "Pushed changes to main"
            : "Pushed changes to a project branch",
        url,
      };
    }
    case "PullRequestEvent":
      return {
        Icon: GitPullRequest,
        label: `${capitalize(event.payload.action)} a pull request`,
        url,
      };
    case "PullRequestReviewEvent":
      return {
        Icon: GitPullRequest,
        label: "Reviewed a pull request",
        url,
      };
    case "PullRequestReviewCommentEvent":
      return {
        Icon: MessageSquareText,
        label: "Updated a pull request",
        url,
      };
    case "IssuesEvent":
      return {
        Icon: CircleDot,
        label: `${capitalize(event.payload.action)} an issue`,
        url,
      };
    case "IssueCommentEvent":
      return {
        Icon: MessageSquareText,
        label: "Updated an issue",
        url,
      };
    case "CreateEvent":
      return {
        Icon: GitBranch,
        label:
          event.payload.ref_type === "repository"
            ? "Published a new repository"
            : "Created a project branch",
        url,
      };
    case "ReleaseEvent":
      return {
        Icon: PackageOpen,
        label: `${capitalize(event.payload.action)} a project release`,
        url,
      };
    case "WatchEvent":
      return { Icon: Star, label: "Received a public star", url };
    default:
      return { Icon: GitCommitHorizontal, label: "Updated the project", url };
  }
}

function toActivityItem(event: GitHubEvent): ActivityItem {
  return {
    ...describeEvent(event),
    actor: event.actor.login,
    createdAt: event.created_at,
    id: event.id,
    repository: event.repo.name,
  };
}

function decodeXml(value: string) {
  const entities: Record<string, string> = {
    "&#39;": "'",
    "&amp;": "&",
    "&apos;": "'",
    "&gt;": ">",
    "&lt;": "<",
    "&quot;": '"',
  };

  return value.replace(
    /&(amp|apos|gt|lt|quot|#39);/g,
    (entity) => entities[entity] ?? entity,
  );
}

function readXmlElement(entry: string, element: string) {
  const match = entry.match(
    new RegExp(`<${element}(?:\\s[^>]*)?>([\\s\\S]*?)</${element}>`),
  );
  return match ? decodeXml(match[1].replace(/\s+/g, " ").trim()) : "";
}

async function getCommitFeed(): Promise<ActivityItem[]> {
  try {
    const response = await fetch(
      `https://github.com/${GITHUB_ORG}/Illustriober-cr/commits/main.atom`,
      { next: { revalidate: 1800, tags: ["github-activity"] } },
    );

    if (!response.ok) return [];

    const feed = await response.text();
    const entries = feed.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

    return entries.slice(0, 6).flatMap((entry) => {
      const id = readXmlElement(entry, "id");
      const createdAt = readXmlElement(entry, "updated");
      const actor = readXmlElement(entry, "name");
      const url = decodeXml(entry.match(/<link[^>]+href="([^"]+)"/)?.[1] ?? "");

      if (!id || !createdAt || !url) return [];

      return [
        {
          Icon: GitCommitHorizontal,
          actor: actor || GITHUB_ORG,
          createdAt,
          id,
          label: "Pushed changes to main",
          repository: `${GITHUB_ORG}/Illustriober-cr`,
          url,
        },
      ];
    });
  } catch {
    return [];
  }
}

async function getPublicActivity(): Promise<ActivityItem[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Illustriober-Creatives-Website",
    "X-GitHub-Api-Version": "2026-03-10",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/orgs/${GITHUB_ORG}/events?per_page=30`,
      {
        headers,
        next: { revalidate: 1800, tags: ["github-activity"] },
      },
    );

    if (response.ok) {
      const events = (await response.json()) as GitHubEvent[];
      const activity = events
        .filter((event) => !event.actor.login.endsWith("[bot]"))
        .sort(
          (first, second) =>
            new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
        )
        .slice(0, 6)
        .map(toActivityItem);

      if (activity.length > 0) return activity;
    }
  } catch {
    // The public events endpoint has a shared-IP rate limit. The public Atom
    // commit feed below keeps the section useful without exposing a token.
  }

  return getCommitFeed();
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
});

const numberFormatter = new Intl.NumberFormat("en");

const contributionLevelClasses = [
  "fill-[#F4EFE5]/10",
  "fill-[#FBD28F]",
  "fill-[#F7AD45]",
  "fill-[#F39314]",
  "fill-[#D96800]",
];

function getContributionWeeks(days: ContributionDay[]) {
  if (days.length === 0) return [];

  const leadingDays = new Date(`${days[0].date}T00:00:00.000Z`).getUTCDay();
  const cells: Array<ContributionDay | null> = [
    ...Array.from({ length: leadingDays }, () => null),
    ...days,
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  return Array.from({ length: cells.length / 7 }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );
}

function ContributionCalendar({
  days,
  mobile = false,
}: {
  days: ContributionDay[];
  mobile?: boolean;
}) {
  const visibleDays = mobile ? days.slice(-126) : days;
  const weeks = getContributionWeeks(visibleDays);
  const cellSize = 10;
  const cellGap = 3;
  const cellPitch = cellSize + cellGap;
  const leftGutter = 32;
  const topGutter = 22;
  const width = leftGutter + weeks.length * cellPitch;
  const height = topGutter + 7 * cellPitch;
  return (
    <svg
      aria-label={`${mobile ? "Recent" : "Rolling year"} contribution calendar. Yellow squares indicate days with public GitHub contributions.`}
      className="h-auto w-full"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <text className="fill-[#F4EFE5]/75 text-[10px]" x="0" y={topGutter + cellPitch * 2 - 2}>
        Mon
      </text>
      <text className="fill-[#F4EFE5]/75 text-[10px]" x="0" y={topGutter + cellPitch * 4 - 2}>
        Wed
      </text>
      <text className="fill-[#F4EFE5]/75 text-[10px]" x="0" y={topGutter + cellPitch * 6 - 2}>
        Fri
      </text>

      {weeks.map((week, weekIndex) => {
        const firstDay = week.find((day): day is ContributionDay => day !== null);
        const previousFirstDay = weeks[weekIndex - 1]?.find(
          (day): day is ContributionDay => day !== null,
        );
        const month = firstDay
          ? new Date(`${firstDay.date}T00:00:00.000Z`).getUTCMonth()
          : -1;
        const previousMonth = previousFirstDay
          ? new Date(`${previousFirstDay.date}T00:00:00.000Z`).getUTCMonth()
          : -1;
        const showMonth = firstDay && month !== previousMonth;

        return (
          <g key={firstDay?.date ?? `empty-${weekIndex}`}>
            {showMonth ? (
              <text
                className="fill-[#F4EFE5]/75 text-[10px]"
                x={leftGutter + weekIndex * cellPitch}
                y="10"
              >
                {shortDateFormatter.format(
                  new Date(`${firstDay.date}T00:00:00.000Z`),
                )
                .replace(/\d+/g, "")
                .trim()}
              </text>
            ) : null}
            {week.map((day, dayIndex) =>
              day ? (
                <rect
                  className={`${contributionLevelClasses[day.level]} stroke-[#F4EFE5]/10`}
                  height={cellSize}
                  key={day.date}
                  rx="2"
                  width={cellSize}
                  x={leftGutter + weekIndex * cellPitch}
                  y={topGutter + dayIndex * cellPitch}
                >
                  <title>
                    {day.count === 0
                      ? `No contributions on ${day.date}`
                      : `${numberFormatter.format(day.count)} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                  </title>
                </rect>
              ) : null,
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ContributionPanel({ snapshot }: { snapshot: ContributionSnapshot }) {
  const busiestDay = snapshot.busiestDay;
  const metrics = [
    {
      label: "Contributions",
      note: "Last 365 days",
      value: numberFormatter.format(snapshot.total),
    },
    {
      label: "Last 30 days",
      note: "Recent output",
      value: numberFormatter.format(snapshot.last30Days),
    },
    {
      label: "Active days",
      note: "Days with activity",
      value: numberFormatter.format(snapshot.activeDays),
    },
    {
      label: "Longest streak",
      note: snapshot.currentStreak
        ? `${snapshot.currentStreak}-day current streak`
        : "Consecutive active days",
      value: `${numberFormatter.format(snapshot.longestStreak)} days`,
    },
  ];

  return (
    <>
      <dl className="grid grid-cols-2 overflow-hidden rounded-[1.5rem] border border-[#F4EFE5]/15 bg-[#F4EFE5]/[0.05]">
        {metrics.map((metric, index) => (
          <div
            className={`flex min-w-0 flex-col p-5 sm:p-6 ${index % 2 === 0 ? "border-r border-[#F4EFE5]/15" : ""} ${index < 2 ? "border-b border-[#F4EFE5]/15" : ""}`}
            key={metric.label}
          >
            <dd className="order-1 font-display text-3xl leading-none tabular-nums text-[#FFFDF8] sm:text-4xl">
              {metric.value}
            </dd>
            <dt className="order-2 mt-3 text-sm font-bold text-[#FFFDF8]">{metric.label}</dt>
            <dd className="order-3 mt-1 text-xs leading-5 text-[#F4EFE5]/75">{metric.note}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 rounded-[1.5rem] border border-[#F4EFE5]/15 bg-[#173D31] p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#FFFDF8]">Daily contribution rhythm</p>
            <p className="mt-1 text-xs leading-5 text-[#F4EFE5]/75">
              Rolling 365 days from the public @{GITHUB_USER} profile.
            </p>
          </div>
          {busiestDay ? (
            <p className="text-xs leading-5 text-[#F4EFE5]/65">
              Busiest day · {shortDateFormatter.format(new Date(`${busiestDay.date}T00:00:00.000Z`))} · {numberFormatter.format(busiestDay.count)} contributions
            </p>
          ) : null}
        </div>

        <div className="mt-5 sm:hidden">
          <ContributionCalendar days={snapshot.days} mobile />
        </div>
        <div className="mt-5 hidden sm:block">
          <ContributionCalendar days={snapshot.days} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#F4EFE5]/10 pt-4 text-xs text-[#F4EFE5]/75">
          <span className="sm:hidden">Latest 18 weeks</span>
          <span className="hidden sm:inline">Last 365 days</span>
          <div className="flex items-center gap-2">
            <span>Less</span>
            {contributionLevelClasses.map((levelClass) => (
              <svg aria-hidden="true" className="h-3 w-3" key={levelClass} viewBox="0 0 12 12">
                <rect className={levelClass} height="12" rx="2" width="12" />
              </svg>
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </>
  );
}

export async function GitHubActivity() {
  const [activity, contributionSnapshot] = await Promise.all([
    getPublicActivity(),
    getGitHubContributionSnapshot(),
  ]);
  const visibleActivity = activity
    .filter(
      (item, index, items) =>
        items.findIndex((candidate) => candidate.repository === item.repository) === index,
    )
    .slice(0, 4);

  return (
    <section
      aria-labelledby="github-activity-title"
      className="mt-20 overflow-hidden rounded-[2rem] bg-[#1F4D3D] text-[#F4EFE5] md:mt-24"
    >
      <div className="grid border-b border-[#F4EFE5]/15 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="border-b border-[#F4EFE5]/15 p-7 md:p-10 lg:border-b-0 lg:border-r lg:p-12">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F39314] text-[#171717]">
              <Github aria-hidden="true" className="h-6 w-6" />
            </div>
            <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-[#F7AD45]">
              Proof of practice
            </p>
            <h2
              className="mt-5 max-w-md font-display text-5xl leading-[0.92] tracking-[-0.04em] md:text-6xl"
              id="github-activity-title"
            >
              A year of work, in the open.
            </h2>
            <p className="mt-6 max-w-md leading-7 text-[#F4EFE5]/75">
              Public contributions and organisation updates.
            </p>
          </div>
          <a
            className="mt-10 inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#F4EFE5] px-5 text-sm font-bold text-[#171717] transition-colors hover:bg-white"
            href={GITHUB_ORG_URL}
            rel="noreferrer"
            target="_blank"
          >
            <Github aria-hidden="true" className="h-4 w-4" />
            Visit the organisation
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>

        <div className="p-5 sm:p-7 lg:p-10">
          {contributionSnapshot ? (
            <ContributionPanel snapshot={contributionSnapshot} />
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#F4EFE5]/20 p-8 text-center">
              <GitBranch aria-hidden="true" className="h-8 w-8 text-[#F7AD45]" />
              <h3 className="mt-5 font-display text-3xl">The contribution map is catching up.</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#F4EFE5]/65">
                GitHub&apos;s public history is temporarily unavailable here. The profile still has the complete record.
              </p>
              <a
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold underline decoration-[#F39314] decoration-2 underline-offset-4"
                href={GITHUB_USER_URL}
                rel="noreferrer"
                target="_blank"
              >
                Open @{GITHUB_USER}
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-7 lg:p-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold">Latest public work</p>
            <p className="mt-1 text-xs text-[#F4EFE5]/75">
              Public project names and high-level updates only.
            </p>
          </div>
          <p className="text-xs text-[#F4EFE5]/75">Refreshes every 30 minutes</p>
        </div>

        {visibleActivity.length > 0 ? (
          <ol className={visibleActivity.length === 1 ? "grid gap-3" : "grid gap-3 md:grid-cols-2"}>
            {visibleActivity.map((item) => {
              const repository = item.repository.split("/").at(-1) ?? item.repository;

              return (
                <li key={item.id}>
                  <a
                    aria-label={`${item.label} in ${item.repository} on GitHub`}
                    className="group flex min-h-32 items-start gap-4 rounded-[1.25rem] border border-[#F4EFE5]/15 bg-[#F4EFE5]/[0.05] p-4 transition-colors hover:bg-[#F4EFE5]/[0.1] sm:p-5"
                    href={item.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4EFE5]/10 text-[#F7AD45]">
                      <item.Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                        <p className="font-display text-xl leading-none text-[#FFFDF8]">
                          {repository}
                        </p>
                        <span className="shrink-0 text-xs text-[#F4EFE5]/75">
                          {dateFormatter.format(new Date(item.createdAt))}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#F4EFE5]/75">
                        {item.label}
                      </p>
                    </div>
                  </a>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#F4EFE5]/20 p-8 text-center">
              <GitBranch aria-hidden="true" className="h-8 w-8 text-[#F7AD45]" />
              <h3 className="mt-5 font-display text-3xl">The feed is catching up.</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#F4EFE5]/65">
                Public activity is temporarily unavailable here. The organisation
                profile still has the complete record.
              </p>
              <a
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold underline decoration-[#F39314] decoration-2 underline-offset-4"
                href={GITHUB_ORG_URL}
                rel="noreferrer"
                target="_blank"
              >
                Open GitHub
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
          </div>
        )}
      </div>
    </section>
  );
}
