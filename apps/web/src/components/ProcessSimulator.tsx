'use client';

import { useState } from 'react';
import { Container } from './Container';
import { MessageSquare, LayoutList, Hammer, GitMerge } from 'lucide-react';

const stages = [
  {
    id: 'brief',
    label: 'Brief',
    icon: MessageSquare,
    headline: 'We listen before we build.',
    visual: (
      <div className="space-y-3">
        {[
          { from: 'You', msg: 'We need a client portal — invites, projects, tickets.', accent: true },
          { from: 'Studio', msg: 'Got it. We\'ll map the flows and lock scope by Friday.', accent: false },
          { from: 'You', msg: 'What about mobile?', accent: true },
          { from: 'Studio', msg: 'Responsive-first. No extra charge.', accent: false },
        ].map((m, i) => (
          <div key={i} className={`flex items-start gap-3 ${m.accent ? 'justify-end' : ''}`}>
            {!m.accent && (
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] text-accent font-bold">IC</span>
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${m.accent ? 'bg-accent/15 border border-accent/20' : 'bg-white/5 border border-white/5'}`}>
              <p className="text-[11px] text-foreground/70 leading-relaxed">{m.msg}</p>
            </div>
            {m.accent && (
              <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] text-foreground/50 font-bold">You</span>
              </div>
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: LayoutList,
    headline: 'Scope locked before a line is written.',
    visual: (
      <div className="space-y-2">
        {[
          { phase: 'Phase 1', title: 'Auth + Invite System',     status: '✓', done: true },
          { phase: 'Phase 2', title: 'Client Dashboard',         status: '✓', done: true },
          { phase: 'Phase 3', title: 'Ticket & Comment System',  status: '✓', done: true },
          { phase: 'Phase 4', title: 'Portfolio CMS',            status: '→', done: false },
          { phase: 'Phase 5', title: 'Notifications',            status: '–', done: false },
        ].map((p) => (
          <div key={p.phase} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${p.done ? 'bg-accent/5 border-accent/15' : 'bg-white/2 border-white/5'}`}>
            <span className={`text-xs font-bold ${p.done ? 'text-accent' : 'text-foreground/25'}`}>{p.status}</span>
            <span className="text-[10px] text-foreground/30 font-mono w-14 flex-shrink-0">{p.phase}</span>
            <span className={`text-xs ${p.done ? 'text-foreground/70' : 'text-foreground/30'}`}>{p.title}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'build',
    label: 'Build',
    icon: Hammer,
    headline: 'Daily commits. Transparent progress.',
    visual: (
      <div className="space-y-2 font-mono">
        {[
          { hash: 'a3f2c1', msg: 'feat: invite token system + email dispatch',   time: '2h ago',  hot: true },
          { hash: 'd81bb4', msg: 'feat: client dashboard with project cards',     time: '6h ago',  hot: false },
          { hash: 'c90ee2', msg: 'fix: refresh token rotation on concurrent req', time: '1d ago',  hot: false },
          { hash: '7f3a91', msg: 'feat: TipTap rich-text editor integration',     time: '2d ago',  hot: false },
        ].map((c) => (
          <div key={c.hash} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border ${c.hot ? 'border-accent/20 bg-accent/5' : 'border-white/5 bg-white/2'}`}>
            <span className={`text-[9px] mt-0.5 flex-shrink-0 ${c.hot ? 'text-accent' : 'text-foreground/20'}`}>{c.hash}</span>
            <span className={`text-[10px] flex-1 leading-relaxed ${c.hot ? 'text-foreground/70' : 'text-foreground/35'}`}>{c.msg}</span>
            <span className="text-[9px] text-foreground/20 flex-shrink-0 whitespace-nowrap">{c.time}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'ship',
    label: 'Ship',
    icon: GitMerge,
    headline: 'Deployed. Yours. Supported.',
    visual: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Uptime', value: '99.9%', accent: true },
            { label: 'Build time', value: '48s', accent: false },
            { label: 'Lighthouse', value: '98 / 100', accent: true },
            { label: 'Deploys', value: '3 today', accent: false },
          ].map((m) => (
            <div key={m.label} className={`rounded-xl border p-3 text-center ${m.accent ? 'bg-accent/8 border-accent/15' : 'bg-white/3 border-white/5'}`}>
              <p className={`text-lg font-display font-medium ${m.accent ? 'text-accent' : 'text-foreground/70'}`}>{m.value}</p>
              <p className="text-[9px] uppercase tracking-widest text-foreground/30 mt-1">{m.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-[11px] text-foreground/60">Production · illustriober.com · All systems operational</span>
        </div>
      </div>
    ),
  },
];

export function ProcessSimulator() {
  const [active, setActive] = useState(0);
  const current = stages[active];
  const Icon = current.icon;

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left: Label + headline + tabs */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent block mb-6">How We Work</span>
            <h2 className="text-4xl md:text-5xl font-display font-medium text-foreground tracking-tight leading-[1.05] mb-12">
              {current.headline}
            </h2>

            {/* Tab buttons */}
            <div className="flex flex-col gap-2">
              {stages.map((s, i) => {
                const SIcon = s.icon;
                const isActive = i === active;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActive(i)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all duration-300 ${
                      isActive
                        ? 'bg-accent/10 border-accent/25 scale-[1.02]'
                        : 'bg-white/2 border-white/5 hover:bg-white/4 hover:border-white/10'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-accent/20' : 'bg-white/5'}`}>
                      <SIcon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-foreground/30'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium transition-colors ${isActive ? 'text-foreground' : 'text-foreground/40'}`}>{s.label}</p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-6 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Visual panel */}
          <div className="glass-card rounded-[2rem] border border-white/8 p-6 min-h-[380px] flex flex-col justify-start">
            {/* Panel header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
                <Icon className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm font-medium text-foreground/60">{current.label} Phase</span>
            </div>

            {/* Dynamic visual */}
            <div key={current.id} className="animate-in fade-in duration-300">
              {current.visual}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
