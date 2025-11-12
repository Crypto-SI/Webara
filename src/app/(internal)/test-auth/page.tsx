'use client';

import { useSimpleAuth } from '@/contexts/auth-context-simple';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute, AdminProtectedRoute } from '@/components/auth/protected-route';
import { Loader2, User, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function TestAuthPage() {
  const {
    user,
    session,
    profile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut
  } = useSimpleAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin mx-auto" />
          <p>Loading authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Authentication Test Page</h1>
          <p className="text-muted-foreground">Test your authentication system</p>
        </div>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Status
            </CardTitle>
            <CardDescription>
              Current authentication state and user information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">User:</span>
                  {user ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Authenticated
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Not Authenticated
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">Session:</span>
                  {session ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="destructive">None</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">Admin:</span>
                  {isAdmin ? (
                    <Badge variant="default" className="bg-purple-600">Yes</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Profile:</span>
                  {profile ? (
                    <Badge variant="default">Loaded</Badge>
                  ) : (
                    <Badge variant="destructive">Not Found</Badge>
                  )}
                </div>

              </div>
            </div>

            {user && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-medium mb-2">User Details:</h3>
                <div className="text-sm space-y-1">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p>
                    <strong>Email:</strong>{' '}
                    {user.primaryEmailAddress?.emailAddress ||
                      user.emailAddresses?.[0]?.emailAddress ||
                      'Unknown'}
                  </p>
                  <p>
                    <strong>Email Confirmed:</strong>{' '}
                    {(
                      user.primaryEmailAddress?.verification?.status ||
                      user.emailAddresses?.[0]?.verification?.status
                    ) === 'verified'
                      ? 'Yes'
                      : 'No'}
                  </p>
                  <p>
                    <strong>Created:</strong>{' '}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : 'Unknown'}
                  </p>
                  <p>
                    <strong>Last Sign In:</strong>{' '}
                    {user.lastSignInAt
                      ? new Date(user.lastSignInAt).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            )}

            {profile && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-medium mb-2">Profile Details:</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Profile ID:</strong> {profile.id}</p>
                  <p><strong>User ID:</strong> {profile.user_id}</p>
                  <p><strong>Full Name:</strong> {profile.full_name}</p>
                  <p><strong>Role:</strong> {profile.role}</p>
                  <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
                  <p><strong>Updated:</strong> {new Date(profile.updated_at).toLocaleString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
            <CardDescription>
              Test authentication functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {user ? (
                <Button onClick={signOut} variant="destructive">
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button onClick={() => window.location.href = '/login'}>
                    Go to Login
                  </Button>
                  <Button onClick={() => window.location.href = '/signup'} variant="outline">
                    Go to Signup
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Protected Route Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Protected Route Test</CardTitle>
              <CardDescription>
                Content that requires authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProtectedRoute>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">✅ Protected Content</h3>
                  <p className="text-sm text-green-700">
                    This content is only visible to authenticated users. You can see this because you&apos;re logged in.
                  </p>
                </div>
              </ProtectedRoute>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Route Test</CardTitle>
              <CardDescription>
                Content that requires admin privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminProtectedRoute>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-medium text-purple-800 mb-2">👑 Admin Content</h3>
                  <p className="text-sm text-purple-700">
                    This content is only visible to administrators. You can see this because you have admin privileges.
                  </p>
                </div>
              </AdminProtectedRoute>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Navigation</CardTitle>
            <CardDescription>
              Navigate to different parts of the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button onClick={() => window.location.href = '/'} variant="outline" size="sm">
                Home
              </Button>
              <Button onClick={() => window.location.href = '/profile'} variant="outline" size="sm">
                Profile
              </Button>
              <Button onClick={() => window.location.href = '/admin'} variant="outline" size="sm">
                Admin
              </Button>
              <Button onClick={() => window.location.href = '/test-supabase'} variant="outline" size="sm">
                Supabase Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
