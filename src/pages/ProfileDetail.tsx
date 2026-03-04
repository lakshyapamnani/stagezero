import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, chatService, startupService } from '../services/api';
import { User, Startup } from '../models/types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, MessageSquare, Briefcase, MapPin, Globe, Linkedin, Github, Twitter, Instagram, ExternalLink, Building2 } from 'lucide-react';

export const ProfileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [founderStartups, setFounderStartups] = useState<Startup[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const data = await userService.getById(id);
        setUser(data);
        
        if (data && data.role === 'founder') {
          const startups = await startupService.getByFounderId(data.id);
          setFounderStartups(startups);
        }
      }
    };
    loadData();
  }, [id]);

  const handleContact = async () => {
    if (!currentUser || !user) return;
    
    // Create or get conversation
    const conversation = await chatService.createConversation([currentUser.id, user.id]);
    navigate(`/chat/${conversation.id}`);
  };

  if (!user) return <div>Loading...</div>;

  const isFreelancer = user.role === 'freelancer';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <Card className="overflow-hidden">
        {/* Header / Cover */}
        <div className="h-32 bg-gradient-to-r from-accent/20 to-surface border-b border-border"></div>
        
        <CardContent className="px-8 pb-8 relative">
          {/* Avatar & Main Info */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 -mt-12 mb-8">
            <div className="flex items-end gap-6">
              <div className="h-32 w-32 rounded-full bg-surface border-4 border-card overflow-hidden shadow-xl flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-4xl font-bold text-secondary-text">{user.name.charAt(0)}</div>
                )}
              </div>
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-primary-text">{user.name}</h1>
                <p className="text-lg text-secondary-text font-medium">{user.title || (isFreelancer ? user.role : 'Founder')}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-secondary-text">
                  {user.location && (
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1" /> {user.location}
                    </div>
                  )}
                  {isFreelancer && (
                    <>
                      <div className="flex items-center text-accent">
                        <Briefcase className="h-3.5 w-3.5 mr-1" /> {user.availability}
                      </div>
                      {user.hourlyRate && (
                        <div className="font-semibold text-primary-text">
                          {user.hourlyRate}
                        </div>
                      )}
                    </>
                  )}
                  {!isFreelancer && founderStartups.length > 0 && (
                    <div className="flex items-center text-accent">
                      <Building2 className="h-3.5 w-3.5 mr-1" /> {founderStartups.length} Startup{founderStartups.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-12 md:mt-0">
              {currentUser?.id === user.id ? (
                <Button size="lg" onClick={() => navigate('/onboarding')}>
                  Edit Profile
                </Button>
              ) : (
                <Button size="lg" onClick={handleContact}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Contact
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: About, Skills, Socials */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-primary-text mb-3">About</h3>
                <p className="text-secondary-text leading-relaxed whitespace-pre-line">{user.bio || "No bio provided."}</p>
              </div>

              {/* Skills - Show for both, but maybe different context for founders */}
              {user.skills && user.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-primary-text mb-3">{isFreelancer ? 'Skills' : 'Expertise'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience (Freelancer) or Startups (Founder) */}
              {isFreelancer && user.experience && user.experience.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-primary-text mb-4">Experience</h3>
                  <div className="space-y-6">
                    {user.experience.map((exp, i) => (
                      <div key={i} className="relative pl-6 border-l border-border last:border-0">
                        <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent"></div>
                        <h4 className="font-bold text-primary-text">{exp.position}</h4>
                        <div className="text-sm text-secondary-text mb-2">{exp.company} • {exp.startDate} - {exp.endDate}</div>
                        <p className="text-sm text-secondary-text">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isFreelancer && founderStartups.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-primary-text mb-4">Startups</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {founderStartups.map(startup => (
                      <Card key={startup.id} className="hover:border-accent/50 transition-colors cursor-pointer" onClick={() => navigate(`/startup/${startup.id}`)}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-primary-text">{startup.name}</h4>
                            <p className="text-sm text-secondary-text line-clamp-1">{startup.shortDescription}</p>
                          </div>
                          <Badge variant={startup.stage === 'Revenue' ? 'success' : 'secondary'}>{startup.stage}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sidebar Info */}
            <div className="space-y-6">
              {user.socials && Object.values(user.socials).some(Boolean) && (
                <div className="bg-surface/30 rounded-xl p-6 border border-border">
                  <h3 className="text-sm font-bold text-secondary-text uppercase tracking-wider mb-4">Connect</h3>
                  <div className="space-y-3">
                    {user.socials.linkedin && (
                      <SocialLink href={user.socials.linkedin} icon={Linkedin} label="LinkedIn" />
                    )}
                    {user.socials.github && (
                      <SocialLink href={user.socials.github} icon={Github} label="GitHub" />
                    )}
                    {user.socials.twitter && (
                      <SocialLink href={user.socials.twitter} icon={Twitter} label="Twitter" />
                    )}
                    {user.socials.instagram && (
                      <SocialLink href={user.socials.instagram} icon={Instagram} label="Instagram" />
                    )}
                    {user.socials.website && (
                      <SocialLink href={user.socials.website} icon={Globe} label="Website" />
                    )}
                  </div>
                </div>
              )}

              {user.tags && user.tags.length > 0 && (
                <div className="bg-surface/30 rounded-xl p-6 border border-border">
                  <h3 className="text-sm font-bold text-secondary-text uppercase tracking-wider mb-4">Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="bg-card">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SocialLink = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center text-sm text-secondary-text hover:text-accent transition-colors group"
  >
    <Icon className="h-4 w-4 mr-3 text-secondary-text group-hover:text-accent" />
    {label}
    <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
  </a>
);
