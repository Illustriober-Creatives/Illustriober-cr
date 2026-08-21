'use client';

/**
 * DashboardMockup — SVG/HTML simulation of the Illustriober client portal
 * Shows: project status bar, ticket list, milestone tracker
 * Used in HeroSection right column
 */

const tickets = [
  { label: 'Homepage redesign', status: 'In Progress', color: 'bg-accent' },
  { label: 'API integration', status: 'Done', color: 'bg-emerald-500' },
  { label: 'Mobile nav fix', status: 'Open', color: 'bg-foreground/20' },
];

const milestones = ['Discovery', 'Design', 'Build', 'Ship'];

export function DashboardMockup() {
  return (
    <div className="relative w-full max-w-[520px] select-none pointer-events-none">
      {/* Glow behind card */}
      <div className="absolute inset-0 bg-accent/10 rounded-[2.5rem] blur-[60px] scale-95" />

      {/* Main card */}
      <div className="relative glass-card rounded-[2rem] border border-white/8 overflow-hidden p-6 space-y-5">
        {/* Window chrome */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-red-400/60" />
          <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
          <span className="w-3 h-3 rounded-full bg-green-400/60" />
          <span className="flex-1 mx-4 h-6 rounded-full bg-white/5 flex items-center px-3">
            <span className="text-[9px] text-foreground/25 font-mono">illustriober.com/dashboard</span>
          </span>
        </div>

        {/* Project header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/30 mb-1">Active Project</p>
            <h3 className="text-base font-display font-medium text-foreground">Brand & Web Platform</h3>
          </div>
          <div className="px-3 py-1 rounded-full bg-accent/15 border border-accent/20">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">Live</span>
          </div>
        </div>

        {/* Milestone tracker */}
        <div className="space-y-2">
          <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/25">Milestone Progress</p>
          <div className="flex items-center gap-1">
            {milestones.map((m, i) => (
              <div key={m} className="flex items-center gap-1 flex-1">
                <div className={`h-1.5 flex-1 rounded-full transition-all ${i < 3 ? 'bg-accent' : 'bg-white/10'}`} />
                {i < milestones.length - 1 && (
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i < 2 ? 'bg-accent' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {milestones.map((m, i) => (
              <span key={m} className={`text-[8px] uppercase tracking-widest ${i < 3 ? 'text-accent' : 'text-foreground/20'}`}>
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* Ticket list */}
        <div className="space-y-2">
          <p className="text-[9px] uppercase tracking-[0.2em] text-foreground/25">Recent Tickets</p>
          {tickets.map((t) => (
            <div key={t.label} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/3 border border-white/5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.color}`} />
              <span className="text-xs text-foreground/70 font-light flex-1 truncate">{t.label}</span>
              <span className="text-[9px] text-foreground/30 whitespace-nowrap">{t.status}</span>
            </div>
          ))}
        </div>

        {/* Comment thread preview */}
        <div className="rounded-xl bg-white/3 border border-white/5 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center">
              <span className="text-[8px] text-accent font-bold">A</span>
            </div>
            <span className="text-[9px] text-foreground/40">Admin · 2h ago</span>
          </div>
          <p className="text-[10px] text-foreground/50 leading-relaxed pl-7">
            Design approved ✓ — moving to build phase next sprint.
          </p>
        </div>
      </div>

      {/* Floating stat pill */}
      <div className="absolute -bottom-4 -right-4 glass-card rounded-2xl px-4 py-3 border border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
          <span className="text-accent text-sm font-bold">✓</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">On Schedule</p>
          <p className="text-[9px] text-foreground/45 uppercase tracking-widest">Milestone 3 of 4</p>
        </div>
      </div>

      {/* Floating badge top-left */}
      <div className="absolute -top-3 -left-3 glass-card rounded-xl px-3 py-2 border border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-foreground/65 uppercase tracking-widest">Systems Operational</span>
        </div>
      </div>
    </div>
  );
}
