import Image from 'next/image';
import Link from 'next/link';
import { resolveProjectImage } from '@/lib/imageFallback';

/**
 * PortfolioCard - Display a portfolio/project preview
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
        {/* Image Container */}
        <div className="relative h-64 rounded-xl overflow-hidden mb-4 bg-surface-800">
          <Image
            src={safeImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </div>

        {/* Content */}
        <div>
          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-brand-500 transition-colors">
            {title}
          </h3>

          {/* Client */}
          <p className="text-sm text-surface-400 mb-3">
            {client}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-3 py-1 text-xs rounded-full bg-surface-800 text-surface-300 group-hover:bg-brand-500 group-hover:text-foreground transition-colors"
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
