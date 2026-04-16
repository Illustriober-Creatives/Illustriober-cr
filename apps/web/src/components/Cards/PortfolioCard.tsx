import Image from 'next/image';
import Link from 'next/link';
import { resolveProjectImage } from '@/lib/imageFallback';

/**
 * PortfolioCard - Display a portfolio/project preview
 * Theme-aware component with smooth transitions between light and dark modes
 * Features: Project image, title, client, tech tags, hover effects
 */
interface PortfolioCardProps {
  slug: string;
  image: string;
  title: string;
  client: string;
  tags: string[];
}

export function PortfolioCard({
  slug,
  image,
  title,
  client,
  tags,
}: PortfolioCardProps) {
  const safeImage = resolveProjectImage(image, slug);

  return (
    <Link href={`/work/${slug}`}>
      <div className="group cursor-pointer">
        {/* Image Container - Theme aware */}
        <div className="relative h-64 rounded-xl overflow-hidden mb-4 bg-surface">
          <Image
            src={safeImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Overlay - adapts to theme */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 dark:group-hover:bg-black/40 light:group-hover:bg-black/20 transition-colors" />
        </div>

        {/* Content */}
        <div>
          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
            {title}
          </h3>

          {/* Client */}
          <p className="text-sm text-foreground/60 mb-3">
            {client}
          </p>

          {/* Tags - Theme aware */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-3 py-1 text-xs rounded-full bg-surface/50 border border-surface/20 text-foreground/70 group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
