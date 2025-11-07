'use client';

import type { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User as UserIcon, Mail, Phone, Building, Calendar } from 'lucide-react';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type BusinessRow = Database['public']['Tables']['businesses']['Row'];

interface UserProfileProps {
  user: User;
  profile: ProfileRow | null;
  businesses: BusinessRow[];
  isLoading: boolean;
}

export function UserProfile({ user, profile, businesses, isLoading }: UserProfileProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Manage your personal details and contact information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile?.full_name || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile?.phone || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    profile?.role === 'admin' 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : profile?.role === 'webara_staff'
                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }
                >
                  {profile?.role || 'user'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" disabled>
              <Loader2 className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {businesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Your Businesses
            </CardTitle>
            <CardDescription>
              Businesses you have registered on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businesses.map((business) => (
                <div key={business.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{business.business_name}</h3>
                      <p className="text-muted-foreground">{business.industry}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {business.company_size} • {business.business_type}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {business.business_type}
                    </Badge>
                  </div>
                  {business.description && (
                    <p className="mt-3 text-sm">{business.description}</p>
                  )}
                  {business.website && (
                    <div className="mt-3">
                      <Button variant="outline" size="sm" asChild>
                        <a href={business.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Account Activity
          </CardTitle>
          <CardDescription>
            Your account creation and recent activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-sm">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString()
                  : 'Unknown'
                }
              </p>
            </div>
            <div className="space-y-2">
              <Label>Last Updated</Label>
              <p className="text-sm">
                {profile?.updated_at 
                  ? new Date(profile.updated_at).toLocaleDateString()
                  : 'Unknown'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}