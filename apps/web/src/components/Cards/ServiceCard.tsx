import { ReactNode } from 'react';

/**
 * ServiceCard - Display service with icon and description
 * @param icon - Lucide icon component or custom React component
 * @param title - Service name/title
 * @param description - Service description
 */
interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <div className="p-6 rounded-xl bg-surface-800 border border-surface-700 hover:border-brand-500 transition-all group">
      {/* Icon Section */}
      <div className="mb-4 text-brand-500 group-hover:scale-110 transition-transform">
        <div className="w-12 h-12 flex items-center justify-center">
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-surface-300">
        {description}
      </p>
    </div>
  );
}
