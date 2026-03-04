import React from 'react';
import { User, Application } from '../models/types';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { MessageSquare, Check, X, MoreVertical } from 'lucide-react';
import { cn } from './ui/Button';

interface ApplicantCardProps {
  applicant: User;
  application: Application;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onMessage: (id: string) => void;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({ 
  applicant, 
  application, 
  onAccept, 
  onReject, 
  onMessage 
}) => {
  return (
    <Card className="bg-card border border-border hover:border-border/80 transition-all">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-surface border-2 border-border flex items-center justify-center text-xl font-bold text-secondary-text overflow-hidden">
                {applicant.avatar ? (
                  <img src={applicant.avatar} alt={applicant.name} className="h-full w-full object-cover" />
                ) : (
                  applicant.name.charAt(0)
                )}
              </div>
              {application.matchScore && (
                <div className="absolute -bottom-2 -right-1 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-card">
                  {application.matchScore}%
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-primary-text text-lg">{applicant.name}</h3>
              <p className="text-sm text-secondary-text">{applicant.title || applicant.role}</p>
            </div>
          </div>
          <button className="text-secondary-text hover:text-primary-text">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {applicant.tags?.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-surface border-border text-secondary-text text-[10px] uppercase tracking-wider">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Bio */}
        <p className="text-sm text-secondary-text line-clamp-2 mb-6 h-10">
          "{applicant.bio}"
        </p>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-2">
          <Button 
            className="col-span-2 bg-green-900/20 text-green-500 border border-green-900/50 hover:bg-green-900/30 font-bold text-xs tracking-wide"
            onClick={() => onAccept(application.id)}
          >
            ACCEPT
          </Button>
          <Button 
            className="col-span-1.5 bg-blue-900/20 text-blue-500 border border-blue-900/50 hover:bg-blue-900/30 font-bold text-xs tracking-wide"
            onClick={() => onMessage(applicant.id)}
          >
            MESSAGE
          </Button>
          <Button 
            className="col-span-0.5 bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/30 flex items-center justify-center"
            onClick={() => onReject(application.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
