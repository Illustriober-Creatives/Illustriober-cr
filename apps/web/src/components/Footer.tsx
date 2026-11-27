import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#171717] px-5 py-14 text-[#F4EFE5] md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#F39314] font-display text-lg font-bold text-[#171717]">
              il
            </span>
            <p className="font-display text-2xl">Illustriober Creatives</p>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#F4EFE5]/75">
            Websites, custom software and mobile apps. Engineered with craft and care in Nairobi, Kenya.
          </p>
          <p className="mt-2 text-xs font-mono text-[#F4EFE5]/60">
            Direct inquiry: <a className="text-[#F7AD45] underline decoration-[#F7AD45]/40 underline-offset-4 hover:decoration-[#F7AD45]" href="mailto:hello@illustriober.com">hello@illustriober.com</a>
          </p>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#F4EFE5]/85">
          <Link className="transition-colors hover:text-[#F7AD45]" href="/work">Work</Link>
          <Link className="transition-colors hover:text-[#F7AD45]" href="/services">Services</Link>
          <Link className="transition-colors hover:text-[#F7AD45]" href="/about">About</Link>
          <Link className="transition-colors hover:text-[#F7AD45]" href="/tech-stack">Tech stack</Link>
          <Link className="transition-colors hover:text-[#F7AD45]" href="/enquiry">Contact</Link>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-4 border-t border-white/10 pt-5 text-xs text-[#F4EFE5]/60 sm:flex-row sm:items-center">
        <div>
          © {new Date().getFullYear()} Illustriober Creatives. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <Link className="transition-colors hover:text-white" href="/privacy">Privacy Policy</Link>
          <Link className="transition-colors hover:text-white" href="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
