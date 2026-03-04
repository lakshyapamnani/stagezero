import React, { useEffect, useState } from 'react';
import { startupService } from '../services/api';
import { Startup } from '../models/types';
import { Button } from '../components/ui/Button';
import { Search, Filter } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { StartupCard } from '../components/StartupCard';

export const Marketplace: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadStartups = async () => {
      const allStartups = await startupService.getAll();
      setStartups(allStartups);
    };
    loadStartups();
  }, []);

  const filteredStartups = startups.filter(startup => 
    startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    startup.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    startup.techStack.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Startup Marketplace</h1>
          <p className="text-secondary-text mt-1">Invest your talent in high-potential early-stage ventures.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-text" />
            <Input 
              placeholder="Search startups..." 
              className="pl-9 bg-surface border-border focus:border-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="md" className="bg-surface border-border hover:bg-card">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      {/* Filters Bar (Visual only for now to match UI vibe) */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <Button size="sm" variant="primary" className="rounded-full px-4">All Filters</Button>
        <Button size="sm" variant="outline" className="rounded-full px-4 bg-surface border-border text-secondary-text hover:text-primary-text">Stage: MVP</Button>
        <Button size="sm" variant="outline" className="rounded-full px-4 bg-surface border-border text-secondary-text hover:text-primary-text">Equity-based</Button>
        <Button size="sm" variant="outline" className="rounded-full px-4 bg-surface border-border text-secondary-text hover:text-primary-text">Tech Stack</Button>
        <Button size="sm" variant="outline" className="rounded-full px-4 bg-surface border-border text-secondary-text hover:text-primary-text">Industry</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStartups.map(startup => (
          <StartupCard key={startup.id} startup={startup} />
        ))}
      </div>
    </div>
  );
};
