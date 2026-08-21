# Enquiry Detail UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the Enquiry Detail page to improve visibility, accessibility, and professional aesthetic using the project's Liquid Glass design system.

**Architecture:** Group data into logical, high-contrast "Glass Cards" using a two-column layout on desktop and a single-column layout on mobile.

**Tech Stack:** Next.js, React, Tailwind CSS 4, Lucide React icons.

---

### Task 1: Update Imports and Breadcrumb Header

**Files:**
- Modify: `apps/web/src/app/admin/enquiries/[id]/page.tsx`

- [ ] **Step 1: Add Lucide icons to imports**

```tsx
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Coins, 
  Calendar, 
  Info, 
  Clock, 
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
```

- [ ] **Step 2: Refine Breadcrumb and Header UI**
Update the top section to use a cleaner breadcrumb and a higher-contrast title.

```tsx
// Inside EnquiryDetailPage return
<div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <div>
    <div className="mb-2 flex items-center gap-2">
      <Link href="/admin/enquiries" className="group flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-accent">
        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
        Back to Enquiries
      </Link>
    </div>
    <h1 className="text-3xl font-bold tracking-tight text-white">
      {enquiry.firstName} {enquiry.lastName}
    </h1>
  </div>

  <div className="flex items-center gap-3">
    {canConvert && !convertResult && (
      <Button
        type="button"
        variant="primary"
        className="rounded-xl px-6"
        disabled={converting}
        onClick={() => void handleConvert()}
      >
        {converting ? "Converting..." : "Convert to Client"}
      </Button>
    )}
    {enquiry.status === "CONVERTED" && (
      <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-400 border border-green-500/20">
        <CheckCircle2 className="h-3.5 w-3.5" />
        CONVERTED
      </div>
    )}
  </div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/admin/enquiries/[id]/page.tsx
git commit -m "style(admin): refine enquiry detail header and breadcrumbs"
```

---

### Task 2: Implement Information Grid and Cards

**Files:**
- Modify: `apps/web/src/app/admin/enquiries/[id]/page.tsx`

- [ ] **Step 1: Replace old list view with Grid Layout**
Structure the content into two columns (Desktop).

```tsx
<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
  {/* Left Column - Meta & Info */}
  <div className="space-y-6 lg:col-span-1">
    {/* Identity Card */}
    <div className="glass-card rounded-2xl bg-surface/30 p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-3">
        <User className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Client Identity</h2>
      </div>
      <div className="space-y-4">
        {[
          { label: "Full Name", value: `${enquiry.firstName} ${enquiry.lastName}`, icon: User },
          { label: "Email Address", value: enquiry.email, icon: Mail },
          { label: "Phone Number", value: enquiry.phone ?? "Not provided", icon: Phone },
          { label: "Company", value: enquiry.company ?? "Individual", icon: Building },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{item.label}</p>
            <p className="mt-0.5 text-base font-medium text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Specs Card */}
    <div className="glass-card rounded-2xl bg-surface/30 p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-zinc-800/50 pb-3">
        <Briefcase className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Project Specs</h2>
      </div>
      <div className="space-y-4">
        {[
          { label: "Project Type", value: enquiry.projectType, icon: Briefcase },
          { label: "Budget Range", value: enquiry.budgetRange ?? "Unspecified", icon: Coins },
          { label: "Timeline", value: enquiry.timeline ?? "Flexible", icon: Calendar },
          { label: "Referral Source", value: enquiry.referralSource ?? "Direct", icon: Info },
          { label: "Submitted On", value: new Date(enquiry.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }), icon: Clock },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{item.label}</p>
            <p className="mt-0.5 text-base font-medium text-zinc-200">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Right Column - Content */}
  <div className="lg:col-span-2">
    <div className="glass-card h-full rounded-2xl bg-surface/30 p-8">
      <div className="mb-6 flex items-center gap-2 border-b border-zinc-800/50 pb-4">
        <Info className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-bold text-white">Project Description</h2>
      </div>
      
      <div className="prose prose-invert max-w-none">
        <p className="whitespace-pre-wrap text-lg leading-relaxed text-zinc-300">
          {enquiry.description}
        </p>
      </div>

      {enquiry.adminNotes && (
        <div className="mt-12 rounded-xl border border-accent/20 bg-accent/5 p-6">
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent">
            <Info className="h-3 w-3" />
            Admin Notes
          </p>
          <p className="text-sm leading-relaxed text-zinc-300">
            {enquiry.adminNotes}
          </p>
        </div>
      )}
    </div>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/app/admin/enquiries/[id]/page.tsx
git commit -m "style(admin): implement structured grid and cards for enquiry details"
```

---

### Task 3: Final Polishing and Success State

**Files:**
- Modify: `apps/web/src/app/admin/enquiries/[id]/page.tsx`

- [ ] **Step 1: Refine Conversion Result Banner**
Make the invite link banner look like a premium result card.

```tsx
{convertResult && (
  <div className="mb-8 overflow-hidden rounded-2xl border border-green-500/30 bg-green-500/5">
    <div className="flex items-center gap-3 bg-green-500/10 px-6 py-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-400">
        <CheckCircle2 className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-green-400 uppercase tracking-wide">Client Successfully Converted</p>
        <p className="text-xs text-zinc-400">An invitation email has been sent to {convertResult.email}</p>
      </div>
    </div>
    <div className="p-6">
      <p className="mb-3 text-xs font-medium text-zinc-500 uppercase tracking-widest">Direct Invitation Link</p>
      <div className="flex items-center gap-2 rounded-xl bg-black/40 p-1 pl-4 border border-white/5">
        <code className="flex-1 text-sm text-zinc-300 break-all truncate">
          {baseUrl}/invite/{convertResult.inviteToken}
        </code>
        <Button 
          variant="secondary" 
          size="sm" 
          className="rounded-lg text-xs"
          onClick={() => navigator.clipboard.writeText(`${baseUrl}/invite/${convertResult.inviteToken}`)}
        >
          Copy Link
        </Button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 2: Run build to verify types and compilation**

Run: `npm run build --workspace apps/web`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/admin/enquiries/[id]/page.tsx
git commit -m "style(admin): enhance conversion success banner with copy utility"
```
