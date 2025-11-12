'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@/lib/supabase/client';

export default function TestAdmin() {
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  const checkAdminStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('user_id', user.id)
          .single<{ role: string | null; full_name: string | null }>();

        if (profile) {
          setUserRole(profile.role);
          setMessage(`✅ User: ${user.email}, Role: ${profile.role}, Name: ${profile.full_name}`);
        } else {
          setMessage('❌ No profile found');
        }
      } else {
        setMessage('❌ No user logged in');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    }
  }, [supabase]);

  useEffect(() => {
    void checkAdminStatus();
  }, [checkAdminStatus]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-2xl font-bold text-gray-900">
            Admin Status Test
          </h1>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-4">
              This page tests if the admin user is properly configured.
            </p>
            
            <button
              onClick={checkAdminStatus}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Check Admin Status
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-md text-sm ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {userRole && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Current Role:</strong> {userRole}
              </p>
              {userRole === 'admin' && (
                <p className="text-sm text-blue-600 mt-2">
                  ✅ Admin access confirmed! You can manage all data.
                </p>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              <a href="/admin-login" className="text-indigo-600 hover:text-indigo-500">
                Go to Admin Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
