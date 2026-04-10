import Link from 'next/link';
import { Container } from './Container';
import { Button } from './Button';
import { ArrowRight } from 'lucide-react';

/**
 * CTASection - Full-width call-to-action banner
 * Prompts user to start a project
 */
export function CTASection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Liquid Glow Backdrop */}
      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-accent/20 to-transparent pointer-events-none" />
      
      <Container>
        <div className="glass-card rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10">
            <h2 className="text-5xl lg:text-7xl font-display font-medium text-white mb-8 leading-[1.1]">
              Ready to take your <br /> <span className="text-accent underline decoration-accent/20 underline-offset-8 italic">product next label?</span>
            </h2>
            
            <p className="text-xl text-foreground/60 font-light max-w-xl mx-auto mb-12">
              We&apos;re here to help you solve your product problems and improve your business revenue.
            </p>

            <div className="flex flex-wrap gap-6 justify-center">
              <Link href="/enquiry">
                <Button variant="primary" size="lg" className="rounded-2xl group shadow-[0_0_40px_rgba(249,115,22,0.2)]">
                  Schedule a Free Call
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/40">24h Response</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/40">Free Discovery</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/40">Global Experts</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
