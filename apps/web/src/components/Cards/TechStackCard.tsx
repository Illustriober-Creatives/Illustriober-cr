import Image from 'next/image';

/**
 * TechStackCard - Display a technology with logo and proficiency level
 * Theme-aware component for /tech-stack page
 */
interface TechStackCardProps {
  logo: string;
  name: string;
  proficiency: 'Expert' | 'Proficient' | 'Familiar';
}

export function TechStackCard({
  logo,
  name,
  proficiency,
}: TechStackCardProps) {
  // Map proficiency to theme-aware colors
  const proficiencyColor = {
    Expert: 'bg-accent/15 text-accent',
    Proficient: 'bg-blue-500/15 dark:text-blue-400 light:text-blue-600',
    Familiar: 'bg-surface/20 text-foreground/60',
  };

  return (
    <div className="p-6 rounded-xl glass-card border-glass-border hover:border-accent/40 transition-all flex flex-col items-center text-center group">
      {/* Logo */}
      <div className="w-12 h-12 mb-4 relative group-hover:scale-110 transition-transform">
        <Image
          src={logo}
          alt={name}
          fill
          className="object-contain"
        />
      </div>

      {/* Name */}
      <h3 className="text-base font-semibold text-foreground mb-3">
        {name}
      </h3>

      {/* Proficiency Badge */}
      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${proficiencyColor[proficiency]}`}>
        {proficiency}
      </span>
    </div>
  );
}
