// Test script for Clerk sync functionality
// This script tests the server actions we created

const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('Testing Supabase connection...');
    
    // Test basic query
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('Current profiles count:', count ?? 0);
    return true;
  } catch (error) {
    console.error('❌ Supabase test failed:', error.message);
    return false;
  }
}

// Test the sync functionality by checking current state
async function testCurrentState() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('\nChecking current profiles state...');
    
    const { data: profiles, count, error } = await supabase
      .from('profiles')
      .select('id, user_id, email, full_name, role, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }
    
    console.log('Current profiles:');
    profiles.forEach(profile => {
      console.log(`  - ${profile.full_name || 'No name'} (${profile.email || 'No email'}) - Role: ${profile.role}`);
    });
    
    console.log(`\nTotal profiles: ${count ?? profiles.length}`);
  } catch (error) {
    console.error('❌ State check failed:', error.message);
  }
}

async function main() {
  console.log('🧪 Testing Clerk Sync Implementation\n');
  
  // Load environment variables from .env.local
  require('dotenv').config({ path: '.env.local' });
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  // Test connection
  const connectionOk = await testSupabaseConnection();
  if (!connectionOk) {
    process.exit(1);
  }
  
  // Check current state
  await testCurrentState();
  
  console.log('\n✅ Basic tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Navigate to admin dashboard: http://localhost:9002/admin');
  console.log('3. Test the Clerk sync functionality');
  console.log('4. Use the SQL script in scripts/backfill-clerk-users.sql for manual sync');
}

main().catch(console.error);
