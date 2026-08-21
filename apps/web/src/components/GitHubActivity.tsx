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

const GITHUB_ORG = "Illustriober-Creatives";
const GITHUB_ORG_URL = `https://github.com/${GITHUB_ORG}`;

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
  const issueNumber = event.payload.issue?.number;
  const pullRequestNumber = event.payload.pull_request?.number;

  switch (event.type) {
    case "PushEvent": {
      const branch = event.payload.ref?.replace("refs/heads/", "");
      return {
        Icon: GitCommitHorizontal,
        label: branch ? `Pushed changes to ${branch}` : "Pushed new changes",
        url,
      };
    }
    case "PullRequestEvent":
      return {
        Icon: GitPullRequest,
        label: `${capitalize(event.payload.action)} pull request${pullRequestNumber ? ` #${pullRequestNumber}` : ""}`,
        url,
      };
    case "PullRequestReviewEvent":
      return {
        Icon: GitPullRequest,
        label: `Reviewed pull request${pullRequestNumber ? ` #${pullRequestNumber}` : ""}`,
        url,
      };
    case "PullRequestReviewCommentEvent":
      return {
        Icon: MessageSquareText,
        label: `Commented on pull request${pullRequestNumber ? ` #${pullRequestNumber}` : ""}`,
        url,
      };
    case "IssuesEvent":
      return {
        Icon: CircleDot,
        label: `${capitalize(event.payload.action)} issue${issueNumber ? ` #${issueNumber}` : ""}`,
        url,
      };
    case "IssueCommentEvent":
      return {
        Icon: MessageSquareText,
        label: `Commented on issue${issueNumber ? ` #${issueNumber}` : ""}`,
        url,
      };
    case "CreateEvent":
      return {
        Icon: GitBranch,
        label: `Created ${event.payload.ref_type ?? "repository item"}${event.payload.ref ? ` ${event.payload.ref}` : ""}`,
        url,
      };
    case "ReleaseEvent":
      return {
        Icon: PackageOpen,
        label: `${capitalize(event.payload.action)} release ${event.payload.release?.name ?? event.payload.release?.tag_name ?? ""}`.trim(),
        url,
      };
    case "WatchEvent":
      return { Icon: Star, label: "Starred the repository", url };
    default:
      return { Icon: GitCommitHorizontal, label: "Updated repository activity", url };
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
      const label = readXmlElement(entry, "title");
      const createdAt = readXmlElement(entry, "updated");
      const actor = readXmlElement(entry, "name");
      const url = decodeXml(entry.match(/<link[^>]+href="([^"]+)"/)?.[1] ?? "");

      if (!id || !label || !createdAt || !url) return [];

      return [
        {
          Icon: GitCommitHorizontal,
          actor: actor || GITHUB_ORG,
          createdAt,
          id,
          label,
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

export async function GitHubActivity() {
  const activity = await getPublicActivity();

  return (
    <section
      aria-labelledby="github-activity-title"
      className="mt-20 overflow-hidden rounded-[2rem] bg-[#1F4D3D] text-[#F4EFE5] md:mt-24"
    >
      <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
        <div className="flex flex-col justify-between border-b border-[#F4EFE5]/15 p-7 md:p-10 lg:min-h-[34rem] lg:border-b-0 lg:border-r lg:p-12">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F39314] text-[#171717]">
              <Github aria-hidden="true" className="h-6 w-6" />
            </div>
            <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-[#F7AD45]">
              Public build log
            </p>
            <h2
              className="mt-5 max-w-md font-display text-5xl leading-[0.92] tracking-[-0.04em] md:text-6xl"
              id="github-activity-title"
            >
              See the work moving.
            </h2>
            <p className="mt-6 max-w-md leading-7 text-[#F4EFE5]/75">
              A live view of the public commits, reviews, and releases behind the
              studio—not a polished highlight reel.
            </p>
          </div>
          <a
            className="mt-10 inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#F4EFE5] px-5 text-sm font-bold text-[#171717] transition-colors hover:bg-white"
            href={GITHUB_ORG_URL}
            rel="noreferrer"
            target="_blank"
          >
            Visit the organisation
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <p className="text-sm font-bold">Latest public activity</p>
            <p className="text-xs text-[#F4EFE5]/60">Refreshes every 30 minutes</p>
          </div>

          {activity.length > 0 ? (
            <ol className="grid gap-3 sm:grid-cols-2">
              {activity.map((item) => {
                const repository = item.repository.split("/").at(-1) ?? item.repository;

                return (
                  <li key={item.id}>
                    <a
                      aria-label={`${item.label} in ${item.repository} on GitHub`}
                      className="group flex min-h-44 flex-col justify-between rounded-[1.25rem] border border-[#F4EFE5]/15 bg-[#F4EFE5]/[0.06] p-5 transition-colors hover:bg-[#F4EFE5]/[0.11]"
                      href={item.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4EFE5]/10 text-[#F7AD45]">
                          <item.Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="text-xs text-[#F4EFE5]/55">
                          {dateFormatter.format(new Date(item.createdAt))}
                        </span>
                      </div>
                      <div className="mt-8 min-w-0">
                        <p className="font-bold leading-6 text-[#FFFDF8]">
                          {item.label}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[#F4EFE5]/60">
                          <span className="truncate">{repository}</span>
                          <span className="shrink-0">@{item.actor}</span>
                        </div>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#F4EFE5]/20 p-8 text-center">
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
      </div>
    </section>
  );
}
