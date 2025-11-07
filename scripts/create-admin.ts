import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  const email = 'cryptosi@protonmail.com';
  const password = 'Talent81';

  try {
    console.log('Creating admin user...');

    // 1. Create the user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin'
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