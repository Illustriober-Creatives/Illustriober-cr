import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    number: "01",
    title: "Websites",
    description: "Help customers understand what you do, trust your business, and take the next step.",
    examples: "Business sites · Online shops · Booking pages",
    enquiryType: "web",
  },
  {
    number: "02",
    title: "Custom software",
    description: "Bring scattered tasks and information into a system built around how your team works.",
    examples: "Client portals · Staff dashboards · Order tracking",
    enquiryType: "software",
  },
  {
    number: "03",
    title: "Mobile apps",
    description: "Give people a useful way to book, order, or stay connected from their phones.",
    examples: "Customer apps · Membership apps · Field tools",
    enquiryType: "mobile",
  },
];

export function ServiceFlipCards() {
  return (
    <div className="border-t border-[#171717]/20">
      {services.map((service) => (
        <article className="grid gap-4 border-b border-[#171717]/20 py-8 md:grid-cols-12 md:gap-8 md:py-10" key={service.number}>
          <span className="pt-1 text-xs font-bold tracking-[0.15em] text-[#1F4D3D] md:col-span-1">{service.number}</span>
          <h3 className="font-display text-4xl leading-none tracking-[-0.035em] md:col-span-4 md:text-5xl">{service.title}</h3>
          <div className="md:col-span-7">
            <p className="max-w-xl text-lg leading-8 text-[#171717]">{service.description}</p>
            <p className="mt-3 text-sm leading-6 text-[#5F5A50]">{service.examples}</p>
            <Link className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#1F4D3D] underline decoration-[#F39314] decoration-2 underline-offset-4" href={`/enquiry?service=${service.enquiryType}`}>
              Talk about {service.title.toLowerCase()} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
