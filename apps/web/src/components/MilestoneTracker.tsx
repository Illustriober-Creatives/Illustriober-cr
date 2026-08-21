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

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; ring: string; bg: string; text: string }> = {
  COMPLETE:    { label: "Complete",    ring: "ring-orange-500",  bg: "bg-orange-500",     text: "text-orange-500" },
  IN_PROGRESS: { label: "In Progress", ring: "ring-blue-400",    bg: "bg-blue-400/20",    text: "text-blue-400" },
  PENDING:     { label: "Pending",     ring: "ring-zinc-700",    bg: "bg-zinc-800",        text: "text-zinc-500" },
};

export function MilestoneTracker({ milestones }: MilestoneTrackerProps) {
  if (!milestones.length) {
    return (
      <p className="text-sm text-zinc-500">No milestones defined for this project yet.</p>
    );
  }

  const sorted = [...milestones].sort((a, b) => a.order - b.order);
  const completeCount = sorted.filter((m) => m.status === "COMPLETE").length;
  const pct = Math.round((completeCount / sorted.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
          <span>{completeCount} of {sorted.length} complete</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-800">
          <div
            className="h-1.5 rounded-full bg-orange-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Step list */}
      <div className="flex flex-col gap-0">
        {sorted.map((milestone, i) => {
          const cfg = STATUS_CONFIG[milestone.status];
          const isLast = i === sorted.length - 1;
          return (
            <div key={milestone.id} className="flex gap-4">
              {/* Connector column */}
              <div className="flex flex-col items-center">
                <div
                  className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ${cfg.ring} ${cfg.bg} transition-all`}
                >
                  {milestone.status === "COMPLETE" ? (
                    <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : milestone.status === "IN_PROGRESS" ? (
                    <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-zinc-600" />
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-px flex-1 ${
                      milestone.status === "COMPLETE" ? "bg-orange-500/40" : "bg-zinc-800"
                    }`}
                    style={{ minHeight: 24 }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                <p className={`text-sm font-medium leading-7 ${cfg.text}`}>
                  {milestone.title}
                </p>
                {milestone.dueDate && (
                  <p className="text-xs text-zinc-600">
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
