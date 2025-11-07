// Test page to verify Supabase integration
'use client';

import { useSimpleAuth } from '@/contexts/auth-context-simple';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestSupabasePage() {
  const { user, loading } = useSimpleAuth();
  const supabase = createSupabaseClient();

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').single();
      console.log('Supabase connection test:', { data, error });
      return { data, error };
    } catch (err) {
      console.error('Supabase connection error:', err);
      return { data: null, error: err };
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Auth Status</h3>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>User: {user ? `${user.email} (${user.id})` : 'Not logged in'}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Environment Variables</h3>
            <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
          </div>

          <Button onClick={testConnection}>
            Test Database Connection
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}