import { createMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";

export const metadata = createMetadata({
  title: "Terms of Service",
  description:
    "Review the general terms that govern use of the Illustriober website, enquiry forms, and client portal.",
  path: "/terms",
});

const sections = [
  {
    title: "Scope",
    body:
      "These terms govern access to the Illustriober website and client portal. Project-specific delivery terms, payment terms, and confidentiality obligations are handled through separate client agreements where applicable.",
  },
  {
    title: "Acceptable Use",
    body:
      "You agree not to misuse the website, attempt unauthorized access, interfere with platform availability, or submit unlawful or misleading content through forms or portal workflows.",
  },
  {
    title: "Intellectual Property",
    body:
      "All site branding, layouts, and proprietary materials remain the property of Illustriober unless otherwise transferred in writing. Client deliverables are governed by the specific contract for that engagement.",
  },
  {
    title: "Liability",
    body:
      "We operate the site in good faith but do not guarantee uninterrupted availability. To the extent allowed by law, indirect or consequential damages arising solely from website use are excluded.",
  },
];

export default function TermsPage() {
  return (
    <main className="flex flex-col w-full bg-background">
      <section className="relative overflow-hidden pt-36 pb-20 lg:pt-44 lg:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-accent-soft blur-3xl" />
          <div className="absolute -bottom-24 left-[-8%] h-64 w-64 rounded-full bg-accent-soft/50 blur-3xl" />
        </div>
        <Container className="relative z-10 max-w-4xl">
          <p className="inline-block rounded-full border border-accent/25 bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Legal
          </p>
          <h1 className="mt-8 text-5xl md:text-6xl font-display font-medium leading-[0.95] tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-foreground/65">
            These terms describe the baseline rules for using the Illustriober
            website and portal.
          </p>
        </Container>
      </section>

      <SectionWrapper>
        <Container className="max-w-4xl">
          <div className="space-y-8">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl border border-glass-border bg-surface/25 p-8"
              >
                <h2 className="text-2xl font-display font-medium text-foreground">
                  {section.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-foreground/65">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </SectionWrapper>
    </main>
  );
}
