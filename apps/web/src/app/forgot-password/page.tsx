import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionWrapper } from "@/components/SectionWrapper";

export const metadata = createMetadata({
  title: "Password Help",
  description: "Get help recovering access to the Illustriober client portal.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-col w-full bg-background min-h-[70vh]">
      <section className="relative overflow-hidden pt-36 pb-20 lg:pt-44 lg:pb-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-accent-soft blur-3xl" />
          <div className="absolute -bottom-24 left-[-8%] h-64 w-64 rounded-full bg-accent-soft/50 blur-3xl" />
        </div>
        <Container className="relative z-10 max-w-3xl text-center">
          <p className="inline-block rounded-full border border-accent/25 bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            Client Portal
          </p>
          <h1 className="mt-8 text-5xl md:text-6xl font-display font-medium leading-[0.95] tracking-tight text-foreground">
            Password recovery
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/65">
            Password reset automation is not public yet. Email the studio and
            we will help restore access manually.
          </p>
        </Container>
      </section>

      <SectionWrapper>
        <Container className="max-w-xl">
          <div className="rounded-2xl border border-glass-border bg-surface/25 p-8 text-center">
            <p className="text-base leading-relaxed text-foreground/65">
              Contact{" "}
              <a
                href="mailto:hello@illustriober.com"
                className="text-accent hover:text-foreground transition-colors"
              >
                hello@illustriober.com
              </a>{" "}
              from the email address linked to your account and include your
              company name so the request can be verified.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/login">
                <Button variant="primary" size="md" className="rounded-xl">
                  Back to sign in
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </SectionWrapper>
    </main>
  );
}
