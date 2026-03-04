import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, cloudinaryService } from '../services/api';
import { User } from '../models/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, Trash2, Linkedin, Github, Twitter, Globe, Instagram } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
    title: '',
    bio: '',
    location: '',
    hourlyRate: '',
    skills: [],
    socials: {
      linkedin: '',
      github: '',
      twitter: '',
      website: '',
      instagram: ''
    },
    experience: [],
    education: [],
  });



  // Helper to update nested state
  const updateSocials = (key: keyof User['socials'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socials: { ...prev.socials, [key]: value }
    }));
  };

  // Image upload temporarily disabled

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        { company: '', position: '', startDate: '', endDate: '', description: '' }
      ]
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExp = [...(formData.experience || [])];
    newExp[index] = { ...newExp[index], [field]: value };
    setFormData(prev => ({ ...prev, experience: newExp }));
  };

  const removeExperience = (index: number) => {
    const newExp = [...(formData.experience || [])];
    newExp.splice(index, 1);
    setFormData(prev => ({ ...prev, experience: newExp }));
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      await userService.update(currentUser.id, formData);
      // Force reload to refresh context or handle via context update
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-text">Complete Your Profile</h1>
          <p className="text-secondary-text mt-2">Help us match you with the best startups.</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            {/* Step 1: Basic Info & Avatar */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-primary-text border-b border-border pb-2">Basic Info</h2>

              {/* Basic Info without avatar upload for now */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Professional Title"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Input
                  label="Location"
                  placeholder="e.g. New York, NY (or Remote)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <Input
                  label="Hourly Rate / Salary Expectation"
                  placeholder="e.g. $80/hr or $120k/yr"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary-text">Skills (comma separated)</label>
                  <Input
                    placeholder="React, Node.js, TypeScript..."
                    value={formData.skills?.join(', ')}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-text">Bio</label>
                <textarea
                  className="w-full min-h-[100px] rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Tell us about your experience and what you're looking for..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </div>

            {/* Step 2: Social Links */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-primary-text border-b border-border pb-2">Social Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-text" />
                  <Input
                    className="pl-9"
                    placeholder="LinkedIn URL"
                    value={formData.socials?.linkedin}
                    onChange={(e) => updateSocials('linkedin', e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-text" />
                  <Input
                    className="pl-9"
                    placeholder="GitHub URL"
                    value={formData.socials?.github}
                    onChange={(e) => updateSocials('github', e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-text" />
                  <Input
                    className="pl-9"
                    placeholder="Twitter URL"
                    value={formData.socials?.twitter}
                    onChange={(e) => updateSocials('twitter', e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-text" />
                  <Input
                    className="pl-9"
                    placeholder="Instagram URL"
                    value={formData.socials?.instagram}
                    onChange={(e) => updateSocials('instagram', e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-text" />
                  <Input
                    className="pl-9"
                    placeholder="Portfolio Website"
                    value={formData.socials?.website}
                    onChange={(e) => updateSocials('website', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Experience */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h2 className="text-xl font-semibold text-primary-text">Experience</h2>
                <Button size="sm" variant="outline" onClick={addExperience}>
                  <Plus className="h-4 w-4 mr-2" /> Add Position
                </Button>
              </div>

              {formData.experience?.map((exp, index) => (
                <div key={index} className="bg-surface/30 p-4 rounded-lg border border-border space-y-4 relative">
                  <button
                    onClick={() => removeExperience(index)}
                    className="absolute top-4 right-4 text-secondary-text hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Company Name"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                    <Input
                      placeholder="Position Title"
                      value={exp.position}
                      onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Start Year"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                      />
                      <Input
                        placeholder="End Year (or Present)"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <textarea
                    className="w-full min-h-[80px] rounded-lg border border-border bg-surface px-3 py-2 text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="Describe your responsibilities and achievements..."
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  />
                </div>
              ))}

              {(!formData.experience || formData.experience.length === 0) && (
                <div className="text-center py-8 text-secondary-text border border-dashed border-border rounded-lg">
                  No experience added yet.
                </div>
              )}
            </div>

            <div className="pt-6 flex justify-end">
              <Button size="lg" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Saving Profile...' : 'Complete Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
