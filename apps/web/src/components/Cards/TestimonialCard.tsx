import Image from 'next/image';
import { resolveTestimonialImage } from '@/lib/imageFallback';

/**
 * TestimonialCard - Display client testimonial with photo, quote, and attribution
 * Theme-aware component that adapts to light and dark modes
 * Used in testimonials carousel
 */
interface TestimonialCardProps {
  quote: string;
  author: string;
  company: string;
  image: string;
}

export function TestimonialCard({
  quote,
  author,
  company,
  image,
}: TestimonialCardProps) {
  const safeImage = resolveTestimonialImage(image, author);

  return (
    <div className="p-8 rounded-xl glass-card border-glass-border hover:border-accent/40 transition-all">
      {/* Quote */}
      <p className="text-lg text-foreground mb-6 leading-relaxed italic">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Author Section */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-surface/20">
          <Image
            src={safeImage}
            alt={author}
            fill
            className="object-cover"
          />
        </div>

        {/* Author Info */}
        <div>
          <p className="font-semibold text-foreground">
            {author}
          </p>
          <p className="text-sm text-foreground/60">
            {company}
          </p>
        </div>
      </div>
    </div>
  );
}
