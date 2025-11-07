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

// Dummy user data
const dummyUsers = [
  {
    email: 'sarah.johnson@techflow.com',
    password: 'DummyUser123!',
    fullName: 'Sarah Johnson',
    phone: '+1-555-0123',
    role: 'user' as const,
    business: {
      business_name: 'TechFlow Solutions',
      industry: 'Software Development',
      website: 'https://techflow.com',
      description: 'Innovative software solutions for modern businesses',
      company_size: '11-50' as const,
      business_type: 'startup' as const,
    },
    quotes: [
      {
        title: 'E-commerce Platform Development',
        website_needs: 'Need a complete e-commerce platform with payment integration, inventory management, and customer analytics',
        collaboration_preferences: 'Looking for a long-term development partner with experience in scalable e-commerce solutions',
        budget_range: '$50,000 - $100,000',
        status: 'under_review' as const,
        estimated_cost: 75000,
        currency: 'USD',
      },
      {
        title: 'Mobile App MVP',
        website_needs: 'iOS and Android app for our service booking platform with real-time notifications',
        collaboration_preferences: 'Prefer agile development methodology with weekly sprints and demos',
        budget_range: '$25,000 - $50,000',
        status: 'pending' as const,
        estimated_cost: 35000,
        currency: 'USD',
      },
    ],
  },
  {
    email: 'michael.chen@greenleaf.com',
    password: 'DummyUser123!',
    fullName: 'Michael Chen',
    phone: '+1-555-0124',
    role: 'user' as const,
    business: {
      business_name: 'Green Leaf Cafe',
      industry: 'Food & Beverage',
      website: 'https://greenleafcafe.com',
      description: 'Organic cafe serving locally sourced sustainable food',
      company_size: '1-10' as const,
      business_type: 'small_business' as const,
    },
    quotes: [
      {
        title: 'Online Ordering System',
        website_needs: 'Website with online ordering, delivery tracking, and customer loyalty program',
        collaboration_preferences: 'Need a simple, user-friendly solution that our staff can easily manage',
        budget_range: '$10,000 - $25,000',
        status: 'accepted' as const,
        estimated_cost: 18000,
        currency: 'USD',
      },
    ],
  },
  {
    email: 'emily.rodriguez@creativeminds.com',
    password: 'DummyUser123!',
    fullName: 'Emily Rodriguez',
    phone: '+1-555-0125',
    role: 'user' as const,
    business: {
      business_name: 'Creative Minds Agency',
      industry: 'Marketing & Advertising',
      website: 'https://creativeminds.com',
      description: 'Full-service digital marketing agency specializing in brand development and content creation',
      company_size: '51-200' as const,
      business_type: 'agency' as const,
    },
    quotes: [
      {
        title: 'Brand Portfolio Website',
        website_needs: 'Showcase website for our client portfolio with case studies, testimonials, and contact forms',
        collaboration_preferences: 'Looking for a visually stunning design that reflects our creative capabilities',
        budget_range: '$25,000 - $50,000',
        status: 'rejected' as const,
        estimated_cost: 30000,
        currency: 'USD',
      },
      {
        title: 'Client Management Portal',
        website_needs: 'Internal portal for managing client projects, sharing files, and tracking progress',
        collaboration_preferences: 'Need secure access controls and integration with our existing tools',
        budget_range: '$50,000 - $100,000',
        status: 'call_requested' as const,
        estimated_cost: 65000,
        currency: 'USD',
      },
    ],
  },
];

async function createDummyData() {
  try {
    console.log('🚀 Starting dummy data creation...');

    for (const userData of dummyUsers) {
      console.log(`\n📝 Creating user: ${userData.fullName}`);

      // 1. Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.fullName,
          phone: userData.phone,
        },
      });

      if (authError) {
        console.error(`❌ Error creating auth user ${userData.email}:`, authError);
        continue;
      }

      console.log(`✅ Auth user created: ${authData.user?.id}`);

      if (!authData.user?.id) {
        console.error(`❌ No user ID returned for ${userData.email}`);
        continue;
      }

      // 2. Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: authData.user.id,
          full_name: userData.fullName,
          phone: userData.phone,
          role: userData.role,
        })
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Error creating profile for ${userData.email}:`, profileError);
        continue;
      }

      console.log(`✅ Profile created: ${profileData.id}`);

      // 3. Create business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          owner_id: authData.user.id,
          ...userData.business,
          contact_preferences: {
            preferred_contact: 'email',
            business_hours: '9 AM - 6 PM EST',
            response_time: '24 hours',
          },
        })
        .select()
        .single();

      if (businessError) {
        console.error(`❌ Error creating business for ${userData.email}:`, businessError);
        continue;
      }

      console.log(`✅ Business created: ${businessData.id}`);

      // 4. Create quotes
      for (const quoteData of userData.quotes) {
        const { data: quoteResult, error: quoteError } = await supabase
          .from('quotes')
          .insert({
            user_id: authData.user.id,
            business_id: businessData.id,
            ...quoteData,
            ai_suggestions: [
              {
                type: 'technology',
                suggestion: 'Consider using React with Next.js for optimal performance',
              },
              {
                type: 'timeline',
                suggestion: 'Estimated 3-4 month development timeline',
              },
            ],
          })
          .select()
          .single();

        if (quoteError) {
          console.error(`❌ Error creating quote for ${userData.email}:`, quoteError);
          continue;
        }

        console.log(`✅ Quote created: ${quoteResult.id} (${quoteData.status})`);
      }
    }

    console.log('\n🎉 Dummy data creation completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Users created: ${dummyUsers.length}`);
    console.log(`- Businesses created: ${dummyUsers.length}`);
    console.log(`- Quotes created: ${dummyUsers.reduce((sum, user) => sum + user.quotes.length, 0)}`);
    
    console.log('\n🔑 Login credentials:');
    dummyUsers.forEach(user => {
      console.log(`- ${user.email}: ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error during dummy data creation:', error);
  }
}

// Run the script
createDummyData();