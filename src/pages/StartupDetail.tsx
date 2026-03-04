import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { startupService, applicationService, userService } from '../services/api';
import { Startup, User } from '../models/types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, CheckCircle, Layers, MapPin, DollarSign, Users, AlertTriangle, Eye, ArrowRight, Code } from 'lucide-react';
import { cn } from '../components/ui/Button';

export const StartupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [founder, setFounder] = useState<User | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const data = await startupService.getById(id);
        setStartup(data);
        
        if (data) {
          const founderData = await userService.getById(data.founderId);
          setFounder(founderData);
        }
        
        if (currentUser && data) {
          const apps = await applicationService.getByFreelancerId(currentUser.id);
          setHasApplied(apps.some(a => a.startupId === data.id));
        }
      }
    };
    loadData();
  }, [id, currentUser]);

  const handleApply = async () => {
    if (!currentUser || !startup) return;
    
    await applicationService.create({
      startupId: startup.id,
      freelancerId: currentUser.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    setHasApplied(true);
  };

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

  if (!startup) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Breadcrumb / Back */}
      <div className="flex items-center text-sm text-secondary-text mb-6">
        <Link to="/marketplace" className="hover:text-primary-text transition-colors">Marketplace</Link>
        <span className="mx-2">›</span>
        <span className="text-primary-text">{startup.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Info Card */}
          <Card className="bg-card border-border overflow-hidden">
            <div className="p-8 flex flex-col items-center text-center">
              <div className={cn(
                "h-24 w-24 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg mb-6",
                getLogoColor(startup.name)
              )}>
                <Layers className="h-10 w-10 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-primary-text mb-3">{startup.name}</h1>
              
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Badge variant="accent" className="uppercase tracking-wider text-[10px] px-2 py-1">
                  {startup.stage} Stage
                </Badge>
                <div className="flex items-center text-xs text-secondary-text bg-surface px-2 py-1 rounded-md border border-border">
                  <MapPin className="h-3 w-3 mr-1" />
                  {startup.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-surface/50 rounded-xl p-4 border border-border/50">
                  <p className="text-xs text-secondary-text uppercase tracking-wider mb-1">Funding</p>
                  <p className="text-lg font-bold text-primary-text">{startup.funding}</p>
                </div>
                <div className="bg-surface/50 rounded-xl p-4 border border-border/50">
                  <p className="text-xs text-secondary-text uppercase tracking-wider mb-1">Team</p>
                  <p className="text-lg font-bold text-primary-text">{startup.teamSize}</p>
                </div>
              </div>

              {currentUser?.role === 'freelancer' && (
                <Button 
                  size="lg" 
                  onClick={handleApply} 
                  disabled={hasApplied}
                  className={cn(
                    "w-full h-12 text-base font-semibold shadow-lg shadow-accent/20",
                    hasApplied ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' : 'bg-accent hover:bg-accent-hover'
                  )}
                >
                  {hasApplied ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" /> Applied to Join
                    </>
                  ) : (
                    <>
                      Apply to Join <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>

          {/* Founding Team */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-4">Founding Team</h3>
              {founder && (
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-surface border border-border flex items-center justify-center text-lg font-bold text-secondary-text">
                    {founder.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-primary-text">{founder.name}</p>
                    <p className="text-xs text-secondary-text">Founder & CEO</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-8 space-y-10">
          {/* Headline & Description */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-text leading-tight mb-6">
              {startup.shortDescription}
            </h2>
            <p className="text-lg text-secondary-text leading-relaxed">
              {startup.fullDescription}
            </p>
          </div>

          {/* Problem & Vision Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center text-accent text-sm font-bold uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4 mr-2" /> The Problem
              </div>
              <p className="text-secondary-text text-sm leading-relaxed">
                {startup.problem}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-accent text-sm font-bold uppercase tracking-wider">
                <Eye className="h-4 w-4 mr-2" /> Our Vision
              </div>
              <p className="text-secondary-text text-sm leading-relaxed">
                {startup.vision}
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <div className="flex items-center text-accent text-sm font-bold uppercase tracking-wider mb-4">
              <Code className="h-4 w-4 mr-2" /> Tech Stack
            </div>
            <div className="flex flex-wrap gap-3">
              {startup.techStack.map(tech => (
                <div key={tech} className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium text-secondary-text hover:text-primary-text hover:border-accent/50 transition-colors cursor-default">
                  {tech}
                </div>
              ))}
            </div>
          </div>

          {/* Open Roles */}
          {startup.openRoles && startup.openRoles.length > 0 && (
            <div className="space-y-4">
              {startup.openRoles.map((role, index) => (
                <Card key={index} className="bg-surface/30 border-border hover:border-accent/30 transition-colors">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-primary-text mb-1">{role.title}</h3>
                        <p className="text-secondary-text">{role.type} • {role.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-accent">{role.salaryRange}</div>
                        <div className="text-sm text-secondary-text">{role.equityRange} Equity</div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <p className="text-xs font-bold text-secondary-text uppercase tracking-wider">Key Responsibilities</p>
                      <ul className="space-y-2">
                        {role.responsibilities.map((resp, i) => (
                          <li key={i} className="flex items-start text-sm text-secondary-text">
                            <span className="mr-2 text-accent">•</span> {resp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium uppercase tracking-wider">
                        <span className="text-secondary-text">Timeline</span>
                        <span className="text-secondary-text">Application period ends in {role.expiresInDays} days</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-accent w-1/3 rounded-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="bg-gradient-to-r from-surface to-card border border-border rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-primary-text mb-1">Ready to build the future?</h3>
              <p className="text-secondary-text text-sm">Applications are reviewed within 48 hours.</p>
            </div>
            {currentUser?.role === 'freelancer' && (
              <Button size="lg" onClick={handleApply} disabled={hasApplied}>
                {hasApplied ? 'Application Sent' : 'Apply Now'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
