import { createMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "Read how Illustriober Collects, uses, and protects personal information shared through this website and client portal.",
  path: "/privacy",
});

const sections = [
  {
    title: "Information We Collect",
    body:
      "We collect the details you submit through enquiry forms, account registration, and direct email communication. This can include your name, email address, company, project information, and portal activity needed to deliver services securely.",
  },
  {
    title: "How We Use Data",
    body:
      "We use collected information to respond to enquiries, manage projects, operate the client portal, improve service delivery, and maintain security. We do not sell personal data.",
  },
  {
    title: "Storage and Security",
    body:
      "We use managed infrastructure, access controls, and HTTPS transport to protect customer data. Data is retained only as long as it supports active service delivery, legal obligations, or legitimate operational needs.",
  },
  {
    title: "Your Rights",
    body:
      "You can request access, correction, or deletion of your personal information by contacting hello@illustriober.com. We will respond within a reasonable time based on applicable obligations and active contractual requirements.",
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-foreground/65">
            This policy explains what information Illustriober collects, why we
            collect it, and how we handle it.
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
