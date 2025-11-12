'use client';

import { useUser } from '@clerk/nextjs';
import { useSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { useEffect, useState } from 'react';

export default function TestClerkSupabasePage() {
  const { user, isLoaded } = useUser();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const supabase = useSupabaseClient();

  const testConnection = async () => {
    setLoading(true);
    setResult('');
    
    if (!user) {
      setResult('No user logged in');
      setLoading(false);
      return;
    }

    try {
      // Test 1: Create a test profile
      const { data: profile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          clerk_user_id: user.id,
          email: user.primaryEmailAddress?.emailAddress ||
            user.emailAddresses?.[0]?.emailAddress ||
            'test@example.com',
          full_name: 'Test User',
        } as never);

      if (createError) {
        setResult(`Error creating profile: ${createError.message}`);
      } else {
        setResult('Profile created successfully');
      }

      // Test 2: Read the profile back
      if (!createError) {
        const { data: readProfile, error: readError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (readError) {
          setResult(`Error reading profile: ${readError.message}`);
        } else {
          setResult(`Profile read: ${JSON.stringify(readProfile)}`);
        }
      }

      // Test 3: Test RLS policy
      const { data: allProfiles, error: readAllError } = await supabase
        .from('profiles')
        .select('*')
        .returns<Database['public']['Tables']['profiles']['Row'][]>();

      if (readAllError) {
        setResult(`Error reading all profiles: ${readAllError.message}`);
      } else {
        // Should only return the current user's profile due to RLS
        const userProfiles = allProfiles?.filter(p => p.user_id === user.id);
        setResult(`RLS working: ${userProfiles.length === 1 ? 'PASS' : 'FAIL'}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setResult(`Test failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Clerk-Supabase Integration</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Authentication Status</h2>
        <p className="text-sm text-gray-600 mb-4">
          User: {user ? user.id : 'Not logged in'}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Loaded: {isLoaded ? 'Yes' : 'No'}
        </p>
        
        <button
          onClick={testConnection}
          disabled={loading || !isLoaded}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Integration'}
        </button>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="text-sm font-medium">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
