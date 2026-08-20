import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#171717] px-5 py-14 text-[#F4EFE5] md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row md:items-end">
        <div><div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#F39314] font-display text-lg font-bold text-[#171717]">il</span><p className="font-display text-2xl">Illustriober Creatives</p></div><p className="mt-5 max-w-sm text-sm leading-6 text-[#F4EFE5]/65">Digital products designed clearly and built with care in Nairobi.</p></div>
        <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#F4EFE5]/75"><Link className="hover:text-[#F7AD45]" href="/work">Work</Link><Link className="hover:text-[#F7AD45]" href="/services">Services</Link><Link className="hover:text-[#F7AD45]" href="/about">About</Link><Link className="hover:text-[#F7AD45]" href="/enquiry">Contact</Link></div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-5 text-xs text-[#F4EFE5]/45">© {new Date().getFullYear()} Illustriober Creatives</div>
    </footer>
  );
}
