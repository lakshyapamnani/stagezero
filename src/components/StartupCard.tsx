import React from 'react';
import { Link } from 'react-router-dom';
import { Startup } from '../models/types';
import { Badge } from './ui/Badge';
import { Users, ArrowRight, Layers } from 'lucide-react';
import { cn } from './ui/Button';

interface StartupCardProps {
  startup: Startup;
}

export const StartupCard: React.FC<StartupCardProps> = ({ startup }) => {
  // Generate a consistent color based on the name for the logo background
  const getLogoColor = (name: string) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-cyan-500 to-blue-600',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="group relative flex flex-col bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1">
      {/* Header: Logo & Badges */}
      <div className="flex justify-between items-start mb-5">
        <div className={cn(
          "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-inner",
          getLogoColor(startup.name)
        )}>
          <Layers className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <Badge variant={
            startup.stage === 'Revenue' ? 'success' : 
            startup.stage === 'MVP' ? 'warning' : 'secondary'
          } className="uppercase text-[10px] tracking-wider font-bold px-2 py-0.5">
            {startup.stage} Stage
          </Badge>
          <Badge variant="accent" className="uppercase text-[10px] tracking-wider font-bold px-2 py-0.5 bg-accent/10 text-accent border-accent/20">
            {startup.compensationType}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-primary-text mb-2 group-hover:text-accent transition-colors">
          {startup.name}
        </h3>
        <p className="text-secondary-text text-sm leading-relaxed line-clamp-2 mb-6">
          {startup.shortDescription}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-6">
          {startup.techStack.slice(0, 3).map((tech) => (
            <span 
              key={tech} 
              className="px-2.5 py-1 rounded-md bg-surface border border-border text-xs font-medium text-secondary-text group-hover:border-border/80 transition-colors"
            >
              {tech}
            </span>
          ))}
          {startup.techStack.length > 3 && (
            <span className="px-2.5 py-1 rounded-md bg-surface border border-border text-xs font-medium text-secondary-text">
              +{startup.techStack.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
        <div className="flex items-center text-secondary-text text-xs font-medium">
          <Users className="h-3.5 w-3.5 mr-1.5" />
          {startup.teamSize || '1-3 members'}
        </div>
        
        <Link 
          to={`/startup/${startup.id}`}
          className="flex items-center text-sm font-medium text-accent hover:text-accent-hover transition-colors group/link"
        >
          View Details
          <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};
