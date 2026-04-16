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
            <h2 className="text-5xl lg:text-8xl font-display font-medium text-foreground mb-10 leading-[0.95] tracking-tighter">
              Ready to <br /> <span className="text-accent italic">elevate</span> your vision?
            </h2>
            
            <p className="text-xl md:text-2xl text-foreground/40 font-light max-w-2xl mx-auto mb-16 px-4">
              Join the elite founders who trust Illustriober Creatives to engineer 
              their most ambitious digital dreams into reality.
            </p>

            <div className="flex flex-wrap gap-8 justify-center">
              <Link href="/enquiry">
                <Button variant="primary" size="lg" className="rounded-full group px-12 py-8 text-xl">
                  Start Your Journey
                  <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1" />
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
