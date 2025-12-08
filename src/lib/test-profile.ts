export const TEST_PROFILE = {
  email: 'info@webarastudio.com',
  name: 'Joe Bloggs',
  firstName: 'Joe',
  lastName: 'Bloggs',
  password: 'Alphabet_chicken123!@#',
  role: 'webara_staff' as const,
  metadata: {
    role: 'webara_staff',
    isTestUser: true,
    source: 'admin_test_suite',
  },
} as const;

export type TestProfileDetails = typeof TEST_PROFILE;

export const TEST_PROFILE_BUSINESS = {
  businessName: 'QA Sandbox Studio',
  industry: 'Creative Agency',
  website: 'https://demo.webarastudio.com',
  description: 'Demo account used to validate admin tooling and collaboration workflows.',
  companySize: '11-50' as const,
  businessType: 'agency' as const,
  contactPreferences: {
    preferredChannel: 'email',
    isTestData: true,
  },
} as const;

export const TEST_PROFILE_QUOTES = [
  {
    title: 'QA Website Refresh',
    websiteNeeds:
      'Full marketing-site refresh focused on faster publishing, reusable sections, and stronger analytics visibility.',
    collaborationPreferences:
      'Prefer async updates twice a week with review checkpoints on Fridays. Need Loom walkthroughs for each drop.',
    budgetRange: '$15k - $25k',
    status: 'under_review' as const,
    aiQuote:
      'Estimated $22,500 for design system polish, CMS cleanup, and KPI dashboard instrumentation. Includes 6 weeks of post-launch QA.',
    suggestedCollaboration:
      'Start with a design systems workshop, then iterate via weekly async drops. Ship KPI tracking before final QA.',
    aiSuggestions: [
      'Add synthetic monitoring to stage environments',
      'Document recurrent QA checklist items in Notion',
      'Automate Lighthouse runs via scheduled CI jobs',
    ],
    estimatedCost: 22500,
    currency: 'USD',
  },
  {
    title: 'QA Content Accelerator',
    websiteNeeds:
      'Need tooling to build, review, and publish landing pages faster with AI-assisted copy and asset management.',
    collaborationPreferences:
      'Weekly sync with Webara strategist, plus shared Slack channel for blockers. Comfortable with quick experiments.',
    budgetRange: '$8k - $12k',
    status: 'pending' as const,
    aiQuote:
      'Estimated $9,800 to implement a section library, connect DAM sources, and set up AI prompts for draft copy.',
    suggestedCollaboration:
      'Pair a content engineer with a strategist to configure the CMS, prompt library, and QA workflows.',
    aiSuggestions: [
      'Seed 10 hero variants for A/B testing',
      'Add schema markup for all new templates',
      'Wire GA4 events to new CTA blocks',
    ],
    estimatedCost: 9800,
    currency: 'USD',
  },
] as const;
