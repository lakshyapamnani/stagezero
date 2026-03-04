import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { LayoutDashboard, Briefcase, Users, MessageSquare, LogOut, Menu, X, User } from 'lucide-react';
import { cn } from '../components/ui/Button';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-accent/10 text-accent'
            : 'text-secondary-text hover:text-primary-text hover:bg-surface'
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary-text tracking-tight">
              Stage<span className="text-accent">Zero</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              {currentUser && (
                <>
                  <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                  {currentUser.role === 'freelancer' && (
                    <NavItem to="/marketplace" icon={Briefcase} label="Startups" />
                  )}
                  {currentUser.role === 'founder' && (
                    <NavItem to="/talent" icon={Users} label="Talent" />
                  )}
                  <NavItem to="/chat" icon={MessageSquare} label="Messages" />
                  <NavItem to={`/profile/${currentUser.id}`} icon={User} label="Profile" />
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="hidden md:block text-sm text-secondary-text">
                  {currentUser.name} <span className="text-xs opacity-50">({currentUser.role})</span>
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-secondary-text hover:text-primary-text"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 space-y-2">
            {currentUser && (
              <>
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                {currentUser.role === 'freelancer' && (
                  <NavItem to="/marketplace" icon={Briefcase} label="Startups" />
                )}
                {currentUser.role === 'founder' && (
                  <NavItem to="/talent" icon={Users} label="Talent" />
                )}
                <NavItem to="/chat" icon={MessageSquare} label="Messages" />
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
