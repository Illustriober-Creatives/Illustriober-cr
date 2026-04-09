import Link from 'next/link';
import { Container } from './Container';
import { SectionWrapper } from './SectionWrapper';
import { SectionHeader } from './SectionHeader';
import { PortfolioCard } from './Cards/PortfolioCard';
import { ArrowRight } from 'lucide-react';

/**
 * PortfolioTeaser - Featured projects preview on home page
 * Shows 3 featured projects with link to full portfolio
 */
const featuredProjects = [
  {
    slug: 'project-1',
    image: 'https://via.placeholder.com/500x300?text=Project+1',
    title: 'TechApp Dashboard',
    client: 'TechCorp Inc',
    tags: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    slug: 'project-2',
    image: 'https://via.placeholder.com/500x300?text=Project+2',
    title: 'Mobile Fitness App',
    client: 'FitLife',
    tags: ['React Native', 'Firebase', 'Expo'],
  },
  {
    slug: 'project-3',
    image: 'https://via.placeholder.com/500x300?text=Project+3',
    title: 'E-Commerce Platform',
    client: 'ShopHub',
    tags: ['Next.js', 'Stripe', 'AWS'],
  },
];

export function PortfolioTeaser() {
  return (
    <SectionWrapper variant="default">
      <Container>
        {/* Header */}
        <SectionHeader
          subtitle="Recent Work"
          title="Featured Projects"
          description="A selection of recent projects we're proud of"
          align="center"
        />

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProjects.map((project) => (
            <PortfolioCard key={project.slug} {...project} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-lg font-semibold text-brand-500 hover:text-brand-400 transition-colors group"
          >
            View All Work
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Container>
    </SectionWrapper>
  );
}
