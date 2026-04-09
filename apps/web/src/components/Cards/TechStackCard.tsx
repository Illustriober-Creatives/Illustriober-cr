import Image from 'next/image';

/**
 * TechStackCard - Display a technology with logo and proficiency level
 * Used in /tech-stack page
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
  // Map proficiency to color
  const proficiencyColor = {
    Expert: 'bg-brand-500/20 text-brand-400',
    Proficient: 'bg-blue-500/20 text-blue-400',
    Familiar: 'bg-surface-700 text-surface-300',
  };

  return (
    <div className="p-6 rounded-xl bg-surface-800 border border-surface-700 hover:border-brand-500 transition-all flex flex-col items-center text-center group">
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
