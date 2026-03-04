import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/api';
import { User } from '../models/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Search, Filter, User as UserIcon } from 'lucide-react';
import { Input } from '../components/ui/Input';

export const TalentMarketplace: React.FC = () => {
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadFreelancers = async () => {
      const allUsers = await userService.getAll();
      setFreelancers(allUsers.filter(u => u.role === 'freelancer'));
    };
    loadFreelancers();
  }, []);

  const filteredFreelancers = freelancers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-primary-text">Find Talent</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-text" />
            <Input 
              placeholder="Search skills..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="md">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.map(freelancer => (
          <Card key={freelancer.id} hover className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-surface border border-border flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-secondary-text" />
                </div>
                <div>
                  <CardTitle className="text-lg">{freelancer.name}</CardTitle>
                  <p className="text-sm text-secondary-text">{freelancer.availability}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-secondary-text line-clamp-3">{freelancer.bio}</p>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link to={`/profile/${freelancer.id}`} className="w-full">
                <Button variant="outline" className="w-full">View Profile</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
