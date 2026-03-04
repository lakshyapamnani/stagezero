import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { startupService, applicationService, chatService, userService } from '../services/api';
import { Startup, Application, Conversation, User, Message } from '../models/types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Briefcase, Bell, Settings, FileText, Users, TrendingUp, Search } from 'lucide-react';
import { ApplicantCard } from '../components/ApplicantCard';
import { Input } from '../components/ui/Input';
import { formatDistanceToNow } from 'date-fns';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [founderApplicants, setFounderApplicants] = useState<{app: Application, user: User}[]>([]);
  const [recentMessages, setRecentMessages] = useState<{user: User, lastMessage: Message}[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      if (currentUser.role === 'founder') {
        const myStartups = await startupService.getByFounderId(currentUser.id);
        setStartups(myStartups);
        
        // Get all applications for my startups
        const allApps: {app: Application, user: User}[] = [];
        for (const startup of myStartups) {
          const apps = await applicationService.getByStartupId(startup.id);
          for (const app of apps) {
            const user = await userService.getById(app.freelancerId);
            if (user && app.status === 'pending') {
              allApps.push({ app, user });
            }
          }
        }
        setFounderApplicants(allApps);
      } else {
        const apps = await applicationService.getByFreelancerId(currentUser.id);
        setApplications(apps);
      }
      
      // Load conversations and recent messages
      const convos = await chatService.getUserConversations(currentUser.id);
      setConversations(convos);

      const recentMsgs = await Promise.all(convos.map(async c => {
        const msgs = await chatService.getMessages(c.id);
        const otherId = c.participants.find(p => p !== currentUser.id);
        const otherUser = otherId ? await userService.getById(otherId) : null;
        const lastMsg = msgs[msgs.length - 1];
        if (otherUser && lastMsg) return { user: otherUser, lastMessage: lastMsg };
        return null;
      }));
      
      setRecentMessages(recentMsgs.filter(Boolean) as {user: User, lastMessage: Message}[]);
    };

    loadData();
  }, [currentUser]);

  const handleAccept = async (appId: string) => {
    await applicationService.updateStatus(appId, 'accepted');
    setFounderApplicants(prev => prev.filter(item => item.app.id !== appId));
    // Ideally show a toast here
  };

  const handleReject = async (appId: string) => {
    await applicationService.updateStatus(appId, 'rejected');
    setFounderApplicants(prev => prev.filter(item => item.app.id !== appId));
  };

  const handleMessage = async (userId: string) => {
    if (!currentUser) return;
    const convo = await chatService.createConversation([currentUser.id, userId]);
    navigate(`/chat/${convo.id}`);
  };

  if (!currentUser) return null;

  // FREELANCER DASHBOARD (Keep existing simple view for now)
  if (currentUser.role === 'freelancer') {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary-text">Freelancer Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-primary-text">My Applications</h2>
            {applications.length > 0 ? (
              applications.map(app => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>Application #{app.id.slice(0, 8)}</CardTitle>
                      <Badge variant={
                        app.status === 'accepted' ? 'success' : 
                        app.status === 'rejected' ? 'danger' : 'warning'
                      }>
                        {app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-secondary-text">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Briefcase className="h-12 w-12 text-secondary-text mb-4" />
                  <p className="text-secondary-text mb-4">You haven't applied to any startups yet.</p>
                  <Link to="/marketplace">
                    <Button variant="outline">Browse Startups</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FOUNDER DASHBOARD (New Design)
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">Founder Dashboard</h1>
          <p className="text-secondary-text">Managing talent for <span className="text-accent">{startups[0]?.name || 'Your Startup'}</span></p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-text" />
            <Input placeholder="Search talent..." className="pl-9 bg-surface border-border" />
          </div>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full"><Bell className="h-5 w-5" /></Button>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full"><Settings className="h-5 w-5" /></Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Active Startups" value={startups.length.toString()} icon={Briefcase} />
        <StatsCard label="Total Applicants" value={founderApplicants.length.toString()} icon={Users} />
        <StatsCard label="Match Avg." value="82%" icon={TrendingUp} textClass="text-accent" />
        <StatsCard label="Open Positions" value="12" icon={FileText} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Applicants (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary-text">New Applicants</h2>
            <div className="flex gap-2 text-sm">
              <button className="text-accent font-medium border-b-2 border-accent pb-1">High Priority</button>
              <button className="text-secondary-text hover:text-primary-text pb-1">Recently Active</button>
              <button className="text-secondary-text hover:text-primary-text pb-1">All</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {founderApplicants.length > 0 ? (
              founderApplicants.map(({ app, user }) => (
                <ApplicantCard 
                  key={app.id} 
                  applicant={user} 
                  application={app}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onMessage={handleMessage}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-12 border border-dashed border-border rounded-xl">
                <p className="text-secondary-text">No new applicants yet.</p>
              </div>
            )}
          </div>

          {/* Recent Activity Table */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary-text">Recent Activity</h2>
              <button className="text-sm text-accent hover:underline">View History</button>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface text-secondary-text uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 font-medium">Applicant</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* Mock Data for visual completeness */}
                  <ActivityRow name="Jordan Smith" status="Shortlisted" date="2h ago" />
                  <ActivityRow name="David Ray" status="Offered" date="5h ago" />
                  <ActivityRow name="Sarah Jenkins" status="Rejected" date="1d ago" />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Inbox (1/3 width) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary-text">Inbox</h2>
            <button className="text-secondary-text hover:text-primary-text"><FileText className="h-4 w-4" /></button>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            {recentMessages.length > 0 ? (
              recentMessages.map(({ user, lastMessage }) => (
                <div key={user.id} className="flex gap-3 items-start p-2 hover:bg-surface rounded-lg cursor-pointer transition-colors" onClick={() => handleMessage(user.id)}>
                  <div className="h-10 w-10 rounded-full bg-surface border border-border flex-shrink-0 flex items-center justify-center font-bold text-secondary-text">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-semibold text-primary-text truncate">{user.name}</h4>
                      <span className="text-[10px] text-secondary-text">{formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-xs text-secondary-text truncate">{lastMessage.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-secondary-text text-center py-4">No messages yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, icon: Icon, textClass }: { label: string, value: string, icon: any, textClass?: string }) => (
  <Card className="bg-card border border-border p-4">
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-secondary-text uppercase tracking-wider">{label}</span>
      <div className="flex items-end justify-between">
        <span className={`text-3xl font-bold text-primary-text ${textClass}`}>{value}</span>
        {Icon && <Icon className="h-5 w-5 text-secondary-text mb-1" />}
      </div>
    </div>
  </Card>
);

const ActivityRow = ({ name, status, date }: { name: string, status: string, date: string }) => (
  <tr className="hover:bg-surface/50 transition-colors">
    <td className="px-6 py-4 font-medium text-primary-text flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs">
        {name.charAt(0)}
      </div>
      {name}
    </td>
    <td className="px-6 py-4">
      <Badge variant={status === 'Offered' ? 'success' : status === 'Rejected' ? 'danger' : 'accent'} className="text-[10px] uppercase">
        {status}
      </Badge>
    </td>
    <td className="px-6 py-4 text-right text-secondary-text">{date}</td>
  </tr>
);
