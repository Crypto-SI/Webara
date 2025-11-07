const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  const email = 'cryptosi@protonmail.com';
  const password = 'Talent81';

  try {
    console.log('Creating admin user...');

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created successfully:', authData.user?.id);

    // 2. Create the profile with admin role
    if (authData.user?.id) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: authData.user.id,
          full_name: 'Admin User',
          role: 'admin'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return;
      }

      console.log('Profile created successfully:', profileData);
    }

    console.log('✅ Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('Role: admin');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createAdminUser();