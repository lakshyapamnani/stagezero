import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ArrowRight, Rocket, Users, ShieldCheck } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary-text">
          Where Startups <span className="text-accent">Begin</span>.
        </h1>
        <p className="text-xl text-secondary-text max-w-2xl mx-auto">
          Connect with world-class founders and freelancers. Build the next unicorn, together.
          Equity, cash, or hybrid - you decide.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register?role=founder">
            <Button size="lg" className="w-full sm:w-auto">
              I'm a Founder <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/register?role=freelancer">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              I'm a Freelancer
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl pt-12">
        <FeatureCard 
          icon={Rocket} 
          title="Launch Fast" 
          description="Find the perfect co-founder or early engineer in days, not months." 
        />
        <FeatureCard 
          icon={Users} 
          title="Vetted Talent" 
          description="Access a curated network of professionals ready to build." 
        />
        <FeatureCard 
          icon={ShieldCheck} 
          title="Secure Contracts" 
          description="Standardized equity and contractor agreements built-in." 
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <Card className="text-left bg-surface/50 border-border/50 hover:border-accent/30 transition-colors">
    <CardContent className="pt-6">
      <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-primary-text">{title}</h3>
      <p className="text-secondary-text">{description}</p>
    </CardContent>
  </Card>
);
