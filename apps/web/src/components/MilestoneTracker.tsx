"use client";

type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETE";

interface Milestone {
  id: string;
  title: string;
  order: number;
  status: MilestoneStatus;
  dueDate?: string | null;
}

interface MilestoneTrackerProps {
  milestones: Milestone[];
}

const STATUS_CONFIG: Record<MilestoneStatus, { ring: string; bg: string; text: string }> = {
  COMPLETE: { ring: "ring-accent", bg: "bg-accent", text: "text-accent" },
  IN_PROGRESS: { ring: "ring-blue-400", bg: "bg-blue-400/20", text: "text-blue-400" },
  PENDING: { ring: "ring-glass-border", bg: "bg-glass-bg", text: "text-foreground/40" },
};

export function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  if (!milestones.length) {
    return <p className="text-sm text-foreground/50">No milestones defined for this project yet.</p>;
  }

  const sorted = [...milestones].sort((a, b) => a.order - b.order);
  const completeCount = sorted.filter((m) => m.status === "COMPLETE").length;
  const pct = Math.round((completeCount / sorted.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-foreground/50">
          <span>
            {completeCount} of {sorted.length} complete
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-glass-bg">
          <div
            className="h-1.5 rounded-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-0">
        {sorted.map((milestone, i) => {
          const cfg = STATUS_CONFIG[milestone.status];
          const isLast = i === sorted.length - 1;
          return (
            <div key={milestone.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ${cfg.ring} ${cfg.bg} transition-all`}
                >
                  {milestone.status === "COMPLETE" ? (
                    <svg
                      className="h-3.5 w-3.5 text-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : milestone.status === "IN_PROGRESS" ? (
                    <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-foreground/30" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-px flex-1 ${milestone.status === "COMPLETE" ? "bg-accent/40" : "bg-glass-border"}`}
                    style={{ minHeight: 24 }}
                  />
                )}
              </div>

              <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                <p className={`text-sm font-medium leading-7 ${cfg.text}`}>{milestone.title}</p>
                {milestone.dueDate && (
                  <p className="text-xs text-foreground/40">
                    Due {new Date(milestone.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
