
'use server';

import { auth, clerkClient, type User } from '@clerk/nextjs/server';
import {
  provideAiPoweredQuote,
  type QuoteOutput,
} from '@/ai/flows/provide-ai-powered-quote';
import {
  generateCollaborationSuggestions,
  type CollaborationSuggestionsOutput,
} from '@/ai/flows/generate-collaboration-suggestions';
import { generateTts, type TtsOutput } from '@/ai/flows/generate-tts';
import { QuoteFormSchema, type QuoteFormValues } from '@/lib/types';
import type { BlogPost } from '@/lib/blog-posts';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Database, Json } from '@/lib/database.types';
import { TEST_PROFILE, TEST_PROFILE_BUSINESS, TEST_PROFILE_QUOTES } from '@/lib/test-profile';

type QuoteRow = Database['public']['Tables']['quotes']['Row'];
type QuoteInsert = Database['public']['Tables']['quotes']['Insert'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type BusinessInsert = Database['public']['Tables']['businesses']['Insert'];
type ClerkUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  imageUrl: string | null;
  primaryEmailAddressId: string | null;
  emailAddresses: {
    id: string;
    emailAddress: string;
    verification?: { status?: string | null } | null;
  }[];
  publicMetadata: Record<string, unknown>;
  privateMetadata: Record<string, unknown>;
  unsafeMetadata: Record<string, unknown>;
  createdAt: number | string | null;
  lastSignInAt: number | string | null;
};
type ClerkEmail = {
  email: string;
  verified: boolean;
};
type ClerkUserSummary = {
  id: string;
  email: string | null;
  name: string;
};
type MinimalClerkClient = {
  users: {
    getUser: (id: string) => Promise<User>;
    getUserList: (params: {
      limit?: number;
      offset?: number;
      emailAddress?: string[];
    }) => Promise<{ data: User[] }>;
    createUser: (params: {
      emailAddress: string[];
      password: string;
      firstName?: string;
      lastName?: string;
      publicMetadata?: Record<string, unknown>;
      unsafeMetadata?: Record<string, unknown>;
    }) => Promise<User>;
    deleteUser: (id: string) => Promise<void>;
  };
};

export type AiQuoteAndSuggestions = QuoteOutput &
  CollaborationSuggestionsOutput;

export type QuoteStatus = QuoteRow['status'];

export type MyQuote = {
  id: string;
  title: string;
  summary: string;
  quote: string;
  suggestedCollaboration: string;
  suggestions: string[];
  status: QuoteStatus;
  estimatedCost: number | null;
  currency: string;
  createdAt: string;
};

function summarizeText(text?: string | null, fallback = 'No summary provided yet.'): string {
  if (!text) {
    return fallback;
  }

  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return fallback;
  }

  if (normalized.length <= 160) {
    return normalized;
  }

  return `${normalized.slice(0, 157)}...`;
}

function sanitizeSuggestions(value: QuoteRow['ai_suggestions']): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (value && typeof value === 'object' && 'suggestions' in (value as Record<string, unknown>)) {
    const maybeArray = (value as Record<string, unknown>).suggestions;
    if (Array.isArray(maybeArray)) {
      return maybeArray.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
  }

  return [];
}

function mapQuoteRowToMyQuote(row: QuoteRow): MyQuote {
  return {
    id: row.id,
    title: row.title,
    summary: summarizeText(row.ai_quote ?? row.website_needs),
    quote: row.ai_quote ?? 'This quote is being generated. Please check back shortly.',
    suggestedCollaboration:
      row.suggested_collaboration ??
      'Our team will review your project and share a tailored collaboration path.',
    suggestions: sanitizeSuggestions(row.ai_suggestions),
    status: row.status,
    estimatedCost: row.estimated_cost,
    currency: row.currency ?? 'USD',
    createdAt: row.created_at,
  };
}

function parseBudgetAverage(budget?: string | null): number | null {
  if (!budget) return null;
  const matches = budget.replace(/,/g, '').match(/\d+(\.\d+)?/g);
  if (!matches) return null;
  const values = matches
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  if (values.length === 0) return null;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return Number((sum / values.length).toFixed(2));
}

function inferCurrencyFromText(text?: string | null): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes('eur') || lower.includes('€')) return 'EUR';
  if (lower.includes('gbp') || lower.includes('£')) return 'GBP';
  if (lower.includes('aud')) return 'AUD';
  if (lower.includes('cad')) return 'CAD';
  if (lower.includes('inr') || lower.includes('₹')) return 'INR';
  if (lower.includes('usd') || lower.includes('$')) return 'USD';
  return null;
}

function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toString().toLowerCase();
  return normalized === 'admin' || normalized === 'webara_staff';
}

async function getClerkClient(): Promise<MinimalClerkClient> {
  const maybeClient = clerkClient as unknown;
  if (typeof maybeClient === 'function') {
    // Some Clerk setups expose a function that resolves to the client.
    return (await (maybeClient as () => Promise<MinimalClerkClient>)()) as MinimalClerkClient;
  }
  return maybeClient as MinimalClerkClient;
}

function normalizeRole(role?: string | null): ProfileInsert['role'] {
  if (!role) return 'user';
  const normalized = role.toString().toLowerCase();
  if (normalized === 'admin') return 'admin';
  if (normalized === 'webara_staff') return 'webara_staff';
  return 'user';
}

function resolveClerkEmail(user: ClerkUser): ClerkEmail {
  const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
  const fallback = primary ?? user.emailAddresses[0];

  if (fallback?.emailAddress) {
    return {
      email: fallback.emailAddress,
      verified: fallback.verification?.status === 'verified',
    };
  }

  const sanitizedId = user.id.replace(/[^a-zA-Z0-9]/g, '') || 'user';
  return {
    email: `${sanitizedId.toLowerCase()}@clerk.local`,
    verified: false,
  };
}

function mapClerkUserToProfileInsert(user: ClerkUser): ProfileInsert {
  const { email, verified } = resolveClerkEmail(user);
  return {
    user_id: user.id,
    email,
    full_name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null,
    first_name: user.firstName ?? null,
    last_name: user.lastName ?? null,
    avatar_url: user.imageUrl ?? null,
    role: normalizeRole(user.publicMetadata?.['role'] as string | undefined),
    email_verified: verified,
    clerk_created_at: user.createdAt ? new Date(user.createdAt).toISOString() : null,
    clerk_last_sign_in_at: user.lastSignInAt ? new Date(user.lastSignInAt).toISOString() : null,
    public_metadata: (user.publicMetadata ?? {}) as Json,
    private_metadata: (user.privateMetadata ?? {}) as Json,
    unsafe_metadata: (user.unsafeMetadata ?? {}) as Json,
    clerk_user_id: user.id,
    updated_at: new Date().toISOString(),
  };
}

function summarizeClerkUser(user: ClerkUser): ClerkUserSummary {
  const { email } = resolveClerkEmail(user);
  const name =
    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
    user.username ||
    email ||
    'Unknown user';

  return {
    id: user.id,
    email,
    name,
  };
}

async function requireAdminUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const client = await getClerkClient();
  const user = await client.users.getUser(userId);
  const appRole = (user.publicMetadata?.role as string | undefined) ?? null;
  const unsafeRole = (user.unsafeMetadata?.role as string | undefined) ?? null;

  if (!isAdminRole(appRole) && !isAdminRole(unsafeRole)) {
    throw new Error('Forbidden');
  }
}

async function findClerkUserByEmail(
  client: MinimalClerkClient,
  email: string
): Promise<User | null> {
  const { data } = await client.users.getUserList({
    limit: 5,
    emailAddress: [email],
  });

  return data[0] ?? null;
}

async function findTestClerkUser(client: MinimalClerkClient): Promise<User | null> {
  return findClerkUserByEmail(client, TEST_PROFILE.email);
}

async function findTestProfileRecord(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  clerkUserId?: string | null
): Promise<ProfileRow | null> {
  const filters = [`email.eq.${TEST_PROFILE.email}`];
  if (clerkUserId) {
    filters.push(`user_id.eq.${clerkUserId}`);
    filters.push(`clerk_user_id.eq.${clerkUserId}`);
  }

  let query = supabase.from('profiles').select('*');
  if (filters.length === 1) {
    query = query.eq('email', TEST_PROFILE.email);
  } else {
    query = query.or(filters.join(','));
  }

  const { data, error } = await query.limit(1).maybeSingle();

  if (error && (error as { code?: string }).code !== 'PGRST116') {
    throw error;
  }

  return (data as ProfileRow | null) ?? null;
}

async function deleteTestProfileRecords(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userIds: string[],
  email: string
) {
  const uniqueUserIds = Array.from(
    new Set(userIds.filter((value): value is string => Boolean(value)))
  );

  if (uniqueUserIds.length > 0) {
    const { error: quotesError } = await supabase
      .from('quotes')
      .delete()
      .in('user_id', uniqueUserIds);
    if (quotesError) {
      throw new Error(quotesError.message);
    }

    const { error: businessesError } = await supabase
      .from('businesses')
      .delete()
      .in('owner_id', uniqueUserIds);
    if (businessesError) {
      throw new Error(businessesError.message);
    }
  }

  const profileFilters = [`email.eq.${email}`];
  uniqueUserIds.forEach((id) => {
    profileFilters.push(`user_id.eq.${id}`);
    profileFilters.push(`clerk_user_id.eq.${id}`);
  });

  let profileQuery = supabase.from('profiles').delete();
  if (profileFilters.length === 1) {
    profileQuery = profileQuery.eq('email', email);
  } else {
    profileQuery = profileQuery.or(profileFilters.join(','));
  }

  const { error: profileError } = await profileQuery;
  if (profileError) {
    throw new Error(profileError.message);
  }
}

type TestProfileSeedSummary = {
  businessId: string | null;
  businessCreated: boolean;
  quoteIds: string[];
  quotesCreated: number;
  totalQuotes: number;
};

async function seedTestProfileData(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string
): Promise<TestProfileSeedSummary> {
  const now = new Date().toISOString();
  let businessId: string | null = null;
  let businessCreated = false;

  const { data: existingBusiness, error: existingBusinessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', userId)
    .eq('business_name', TEST_PROFILE_BUSINESS.businessName)
    .maybeSingle();

  if (existingBusinessError && (existingBusinessError as { code?: string }).code !== 'PGRST116') {
    throw new Error(existingBusinessError.message);
  }

  if (existingBusiness?.id) {
    businessId = existingBusiness.id;
  } else {
    const { data: insertedBusiness, error: insertBusinessError } = await supabase
      .from('businesses')
      .insert({
        owner_id: userId,
        business_name: TEST_PROFILE_BUSINESS.businessName,
        industry: TEST_PROFILE_BUSINESS.industry,
        website: TEST_PROFILE_BUSINESS.website,
        description: TEST_PROFILE_BUSINESS.description,
        company_size: TEST_PROFILE_BUSINESS.companySize,
        business_type: TEST_PROFILE_BUSINESS.businessType,
        contact_preferences: TEST_PROFILE_BUSINESS.contactPreferences as Json,
        created_at: now,
        updated_at: now,
      } satisfies BusinessInsert)
      .select('id')
      .single();

    if (insertBusinessError) {
      throw new Error(insertBusinessError.message);
    }

    businessId = insertedBusiness?.id ?? null;
    businessCreated = Boolean(insertedBusiness?.id);
  }

  if (!businessId) {
    throw new Error('Unable to locate or create test business.');
  }

  const { data: existingQuotes, error: existingQuotesError } = await supabase
    .from('quotes')
    .select('id,title')
    .eq('user_id', userId);

  if (existingQuotesError) {
    throw new Error(existingQuotesError.message);
  }

  const existingTitles = new Set((existingQuotes ?? []).map((quote) => quote.title));

  const quotesToInsert: QuoteInsert[] = TEST_PROFILE_QUOTES.filter(
    (quote) => !existingTitles.has(quote.title)
  ).map((quote) => ({
    user_id: userId,
    business_id: businessId,
    title: quote.title,
    website_needs: quote.websiteNeeds,
    collaboration_preferences: quote.collaborationPreferences,
    budget_range: quote.budgetRange,
    ai_quote: quote.aiQuote,
    suggested_collaboration: quote.suggestedCollaboration,
    ai_suggestions: quote.aiSuggestions as Json,
    status: quote.status,
    estimated_cost: quote.estimatedCost,
    currency: quote.currency,
    created_at: now,
    updated_at: now,
  }));

  const seededQuoteIds: string[] = [];

  if (quotesToInsert.length > 0) {
    const { data: insertedQuotes, error: insertQuotesError } = await supabase
      .from('quotes')
      .insert(quotesToInsert)
      .select('id');

    if (insertQuotesError) {
      throw new Error(insertQuotesError.message);
    }

    insertedQuotes?.forEach((quote) => {
      if (quote?.id) {
        seededQuoteIds.push(quote.id);
      }
    });
  }

  return {
    businessId,
    businessCreated,
    quoteIds: seededQuoteIds,
    quotesCreated: seededQuoteIds.length,
    totalQuotes: (existingQuotes?.length ?? 0) + seededQuoteIds.length,
  };
}

function deriveProjectTitle(
  aiResult: AiQuoteAndSuggestions,
  formValues: QuoteFormValues
): string {
  if (aiResult.projectTitle?.trim()) {
    return aiResult.projectTitle.trim().slice(0, 80);
  }

  const needs = formValues.websiteNeeds.trim();
  if (needs) {
    const firstSentence = needs.split(/[.!?]/)[0]?.trim();
    if (firstSentence) {
      return firstSentence.slice(0, 80);
    }
  }

  return `Website project for ${formValues.name}`.slice(0, 80);
}


export async function getAiQuoteAction(
  values: QuoteFormValues
): Promise<{
  success: boolean;
  data: AiQuoteAndSuggestions | null;
  error: string | null;
}> {
  const parsed = QuoteFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, data: null, error: 'Invalid form data.' };
  }

  try {
    const [aiQuote, aiSuggestions] = await Promise.all([
      provideAiPoweredQuote({
        websiteNeeds: parsed.data.websiteNeeds,
        collaborationPreferences:
          parsed.data.collaborationPreferences || 'Not specified',
        budget: parsed.data.budget || 'Not specified',
      }),
      generateCollaborationSuggestions({
        projectRequirements: parsed.data.websiteNeeds,
        collaborationPreferences:
          parsed.data.collaborationPreferences || 'Not specified',
      }),
    ]);

    // Here you would typically save the quote to your database
    // For now, we'll just return it to the client.

    return {
      success: true,
      data: { ...aiQuote, ...aiSuggestions },
      error: null,
    };
  } catch (error) {
    console.error('AI quote and suggestion generation failed:', error);
    return {
      success: false,
      data: null,
      error:
        'Failed to generate AI quote and suggestions. Please try again later.',
    };
  }
}

export async function getTtsAction(
  text: string
): Promise<{ success: boolean; data: TtsOutput | null; error: string | null }> {
  if (!text) {
    return { success: false, data: null, error: 'No text provided.' };
  }

  try {
    const ttsResult = await generateTts(text);
    return { success: true, data: ttsResult, error: null };
  } catch (error) {
    console.error('TTS generation failed:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to generate audio. Please try again later.',
    };
  }
}

export async function proposeQuoteAction({
  formValues,
  aiResult,
}: {
  formValues: QuoteFormValues;
  aiResult: AiQuoteAndSuggestions;
}): Promise<{ success: boolean; data: MyQuote | null; error: string | null }> {
  const parsedForm = QuoteFormSchema.safeParse(formValues);
  if (!parsedForm.success) {
    return { success: false, data: null, error: 'Invalid form data.' };
  }

  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      data: null,
      error: 'Please sign in to propose this project to Webara.',
    };
  }

  try {
    const supabase = createServerSupabaseClient();
    const normalizedAiEstimate = Number.isFinite(aiResult.estimatedCost)
      ? Number(aiResult.estimatedCost)
      : null;
    const estimatedCost =
      normalizedAiEstimate ?? parseBudgetAverage(parsedForm.data.budget);
    const currency =
      (aiResult.currency ||
        inferCurrencyFromText(parsedForm.data.budget) ||
        'USD')
        .toUpperCase();

    const insertPayload: QuoteInsert = {
      user_id: userId,
      title: deriveProjectTitle(aiResult, parsedForm.data),
      website_needs: parsedForm.data.websiteNeeds,
      collaboration_preferences:
        parsedForm.data.collaborationPreferences || null,
      budget_range: parsedForm.data.budget || null,
      ai_quote: aiResult.quote,
      suggested_collaboration: aiResult.suggestedCollaboration,
      ai_suggestions: aiResult.suggestions,
      status: 'pending',
      estimated_cost: estimatedCost ?? null,
      currency,
    };

    const { data, error } = await supabase
      .from('quotes')
      .insert(insertPayload as never)
      .select('*')
      .single();

    if (error || !data) {
      throw error ?? new Error('Failed to save quote.');
    }

    return { success: true, data: mapQuoteRowToMyQuote(data), error: null };
  } catch (error) {
    console.error('Failed to save quote to Supabase:', error);
    return {
      success: false,
      data: null,
      error: 'Unable to save your quote right now. Please try again.',
    };
  }
}

export async function getMyQuotesAction(): Promise<{
  success: boolean;
  data: MyQuote[] | null;
  error: string | null;
}> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, data: null, error: 'Unauthorized' };
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data?.map(mapQuoteRowToMyQuote) ?? [],
      error: null,
    };
  } catch (error) {
    console.error('Failed to load quotes from Supabase:', error);
    return {
      success: false,
      data: null,
      error: 'Unable to load your quotes right now.',
    };
  }
}


export async function getQuoteDetailsAction(id: string): Promise<{
  success: boolean;
  data: MyQuote | null;
  error: string | null;
}> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, data: null, error: 'Unauthorized' };
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return { success: false, data: null, error: 'Quote not found.' };
    }

    return { success: true, data: mapQuoteRowToMyQuote(data), error: null };
  } catch (error) {
    console.error('Failed to load quote details:', error);
    return {
      success: false,
      data: null,
      error: 'Unable to load this quote. Please try again later.',
    };
  }
}

// Clerk user sync actions
export async function syncClerkUser(userId: string): Promise<{
  success: boolean;
  data: any;
  error: string | null;
}> {
  try {
    await requireAdminUser();

    const client = await getClerkClient();
    // Fetch user from Clerk
    const user = await client.users.getUser(userId);
    const normalizedUser = normalizeClerkUser(user);
    const profilePayload = mapClerkUserToProfileInsert(normalizedUser);

    // Create Supabase client with service role key
    const supabase = createServerSupabaseClient();

    // Upsert into Supabase profiles table
    const { data, error } = await (supabase
      .from('profiles') as any)
      // Type cast to accommodate slight typing mismatch between Clerk metadata and our Supabase types.
      .upsert(profilePayload as ProfileInsert, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      throw new Error(error.message);
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Failed to sync Clerk user:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function syncAllClerkUsers(): Promise<{
  success: boolean;
  data: any;
  error: string | null;
}> {
  try {
    await requireAdminUser();

    // Fetch all Clerk users (paginate to cover large tenants)
    const users = await fetchAllClerkUsers(100);
    
    // Create Supabase client with service role key
    const supabase = createServerSupabaseClient();

    // Transform Clerk users to profiles format
    const profiles = users.map(mapClerkUserToProfileInsert);

    // Bulk upsert into Supabase
    const { data, error } = await (supabase
      .from('profiles') as any)
      .upsert(profiles as ProfileInsert[], { onConflict: 'user_id' })
      .select();

    if (error) {
      console.error('Supabase bulk upsert error:', error);
      throw new Error(error.message);
    }

    return {
      success: true,
      data: {
        synced: profiles.length,
        users: data,
        clerkUsers: users.map(summarizeClerkUser),
      },
      error: null
    };
  } catch (error) {
    console.error('Failed to sync all Clerk users:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function getClerkUsersNotInProfiles(): Promise<{
  success: boolean;
  data: any[];
  error: string | null;
}> {
  try {
    await requireAdminUser();

    // Fetch all Clerk users (paginate)
    const clerkUsers = await fetchAllClerkUsers(100);
    
    // Create Supabase client
    const supabase = createServerSupabaseClient();
    
    // Get all existing user IDs from profiles
    const { data: existingProfiles, error: profileError } = await (supabase
      .from('profiles') as any).select('user_id, clerk_user_id');

    if (profileError) {
      throw new Error(profileError.message);
    }

    const existingUserIds = new Set<string>();
    (
      (existingProfiles as { user_id: string | null; clerk_user_id: string | null }[] | null) ?? []
    ).forEach((profile) => {
      if (profile.user_id) {
        existingUserIds.add(profile.user_id);
      }
      if (profile.clerk_user_id) {
        existingUserIds.add(profile.clerk_user_id);
      }
    });

    // Find Clerk users not in profiles
    const missingUsers = clerkUsers.filter(user => !existingUserIds.has(user.id));

    return {
      success: true,
      data: missingUsers.map(user => {
        const { email } = resolveClerkEmail(user);
        const name =
          `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
          user.username ||
          email ||
          'Unknown';

        return {
          id: user.id,
          email,
          name,
        };
      }),
      error: null
    };
  } catch (error) {
    console.error('Failed to get missing Clerk users:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

type TestProfileStatusPayload = {
  clerkUser: {
    id: string;
    email: string | null;
    createdAt: string | null;
    lastSignInAt: string | null;
  } | null;
  profile: ProfileRow | null;
  businessCount: number;
  quoteCount: number;
};

export async function getTestProfileStatus(): Promise<{
  success: boolean;
  data: TestProfileStatusPayload | null;
  error: string | null;
}> {
  try {
    await requireAdminUser();

    const client = await getClerkClient();
    const supabase = createServerSupabaseClient();

    const clerkUser = await findTestClerkUser(client);
    const normalizedUser = clerkUser ? normalizeClerkUser(clerkUser) : null;
    const profile = await findTestProfileRecord(supabase, normalizedUser?.id ?? null);

    let businessCount = 0;
    let quoteCount = 0;

    if (normalizedUser) {
      const [businessResponse, quoteResponse] = await Promise.all([
        supabase
          .from('businesses')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', normalizedUser.id),
        supabase
          .from('quotes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', normalizedUser.id),
      ]);

      if (businessResponse.error) {
        throw new Error(businessResponse.error.message);
      }

      if (quoteResponse.error) {
        throw new Error(quoteResponse.error.message);
      }

      businessCount = businessResponse.count ?? 0;
      quoteCount = quoteResponse.count ?? 0;
    }

    const summary = normalizedUser
      ? {
          id: normalizedUser.id,
          email: resolveClerkEmail(normalizedUser).email,
          createdAt: normalizedUser.createdAt
            ? new Date(normalizedUser.createdAt).toISOString()
            : null,
          lastSignInAt: normalizedUser.lastSignInAt
            ? new Date(normalizedUser.lastSignInAt).toISOString()
            : null,
        }
      : null;

    return {
      success: true,
      data: { clerkUser: summary, profile, businessCount, quoteCount },
      error: null,
    };
  } catch (error) {
    console.error('Failed to load test profile status:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function createTestProfile(): Promise<{
  success: boolean;
  data:
    | {
        clerkUserId: string;
        profile: ProfileRow | null;
        message: string;
        seedSummary: TestProfileSeedSummary;
      }
    | null;
  error: string | null;
}> {
  try {
    await requireAdminUser();

    const client = await getClerkClient();
    const supabase = createServerSupabaseClient();

    let clerkUser = await findTestClerkUser(client);
    let created = false;

    if (!clerkUser) {
      clerkUser = await client.users.createUser({
        emailAddress: [TEST_PROFILE.email],
        password: TEST_PROFILE.password,
        firstName: TEST_PROFILE.firstName,
        lastName: TEST_PROFILE.lastName,
        publicMetadata: TEST_PROFILE.metadata,
        unsafeMetadata: TEST_PROFILE.metadata,
      });
      created = true;
    }

    const normalizedUser = normalizeClerkUser(clerkUser);
    const profilePayload = mapClerkUserToProfileInsert(normalizedUser);

    profilePayload.role = TEST_PROFILE.role;
    profilePayload.first_name = TEST_PROFILE.firstName;
    profilePayload.last_name = TEST_PROFILE.lastName;
    profilePayload.full_name = TEST_PROFILE.name;
    profilePayload.email = TEST_PROFILE.email;
    profilePayload.public_metadata = {
      ...(profilePayload.public_metadata as Record<string, unknown>),
      ...TEST_PROFILE.metadata,
    } as Json;
    profilePayload.unsafe_metadata = {
      ...(profilePayload.unsafe_metadata as Record<string, unknown>),
      ...TEST_PROFILE.metadata,
    } as Json;

    const { data, error } = await (supabase
      .from('profiles') as any)
      .upsert(profilePayload as ProfileInsert, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error (test profile):', error);
      throw new Error(error.message);
    }

    const seedSummary = await seedTestProfileData(supabase, normalizedUser.id);

    return {
      success: true,
      data: {
        clerkUserId: normalizedUser.id,
        profile: data as ProfileRow,
        message: created
          ? 'Test profile created and seeded sample business + quotes.'
          : 'Existing test profile synced and sample data ensured.',
        seedSummary,
      },
      error: null,
    };
  } catch (error) {
    console.error('Failed to create test profile:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function deleteTestProfile(): Promise<{
  success: boolean;
  data: { deletedUserId: string | null; deletedProfileId: string | null } | null;
  error: string | null;
}> {
  try {
    await requireAdminUser();

    const client = await getClerkClient();
    const supabase = createServerSupabaseClient();

    const clerkUser = await findTestClerkUser(client);
    const normalizedUser = clerkUser ? normalizeClerkUser(clerkUser) : null;
    const profile = await findTestProfileRecord(supabase, normalizedUser?.id ?? null);

    const userIds = [
      normalizedUser?.id ?? null,
      profile?.user_id ?? null,
      profile?.clerk_user_id ?? null,
    ].filter((value): value is string => Boolean(value));

    await deleteTestProfileRecords(supabase, userIds, TEST_PROFILE.email);

    if (normalizedUser) {
      await client.users.deleteUser(normalizedUser.id);
    }

    return {
      success: true,
      data: {
        deletedUserId: normalizedUser?.id ?? null,
        deletedProfileId: profile?.id ?? null,
      },
      error: null,
    };
  } catch (error) {
    console.error('Failed to delete test profile:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Omit 'slug' and 'date' as they will be generated
export type NewPostValues = Omit<BlogPost, 'slug' | 'date'>;

export async function createBlogPostAction(
  values: NewPostValues
): Promise<{ success: boolean; data: BlogPost | null; error: string | null }> {
  // This is a placeholder. In a real application, you would save this
  // to your Supabase database. You would also need to handle slug generation
  // to ensure it's unique.
  
  // For demonstration, we'll log the data to the console and return a success response.
  try {
    const slug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const newPost: BlogPost = {
      ...values,
      slug,
      date: new Date().toISOString(),
    };

    console.log('New Blog Post Created (Placeholder):', newPost);

    // In a real app, you would now write `newPost` to your `blog-posts.json`
    // or (preferably) save it to your Supabase database.
    // NOTE: Writing to the filesystem at runtime is not reliable in serverless environments.

    return { success: true, data: newPost, error: null };
  } catch (error) {
    console.error('Failed to create blog post:', error);
    return { success: false, data: null, error: 'An unexpected error occurred.' };
  }
}
function normalizeClerkUser(user: User): ClerkUser {
  return {
    id: user.id,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    username: user.username ?? null,
    imageUrl: user.imageUrl ?? null,
    primaryEmailAddressId: user.primaryEmailAddressId ?? null,
    emailAddresses:
      user.emailAddresses?.map((email) => ({
        id: email.id,
        emailAddress: email.emailAddress,
        verification: email.verification,
      })) ?? [],
    publicMetadata: (user.publicMetadata ?? {}) as Record<string, unknown>,
    privateMetadata: (user.privateMetadata ?? {}) as Record<string, unknown>,
    unsafeMetadata: (user.unsafeMetadata ?? {}) as Record<string, unknown>,
    createdAt: user.createdAt ?? null,
    lastSignInAt: user.lastSignInAt ?? null,
  };
}

type ClerkApiUser = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  image_url?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: {
    id?: string | null;
    email_address: string;
    verification?: { status?: string | null } | null;
  }[];
  public_metadata?: Record<string, unknown>;
  private_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
  created_at?: string | number | null;
  last_sign_in_at?: string | number | null;
};

function mapApiUserToClerkUser(user: ClerkApiUser): ClerkUser {
  return {
    id: user.id,
    firstName: user.first_name ?? null,
    lastName: user.last_name ?? null,
    username: user.username ?? null,
    imageUrl: user.image_url ?? null,
    primaryEmailAddressId: user.primary_email_address_id ?? null,
    emailAddresses:
      user.email_addresses?.map((email) => ({
        id: email?.id ?? email?.email_address ?? '',
        emailAddress: email?.email_address ?? '',
        verification: email?.verification ?? undefined,
      })) ?? [],
    publicMetadata: user.public_metadata ?? {},
    privateMetadata: user.private_metadata ?? {},
    unsafeMetadata: user.unsafe_metadata ?? {},
    createdAt: user.created_at ?? null,
    lastSignInAt: user.last_sign_in_at ?? null,
  };
}

const CLERK_API_URL = 'https://api.clerk.com/v1/users';

async function fetchAllClerkUsers(limit = 100): Promise<ClerkUser[]> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing Clerk secret key. Set CLERK_SECRET_KEY in env.');
  }

  const allUsers: ClerkUser[] = [];
  let offset = 0;

  while (true) {
    const response = await fetch(`${CLERK_API_URL}?limit=${limit}&offset=${offset}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to fetch Clerk users: ${response.status} ${body}`);
    }

    const batch = (await response.json()) as ClerkApiUser[];
    if (!Array.isArray(batch)) {
      break;
    }

    allUsers.push(...batch.map(mapApiUserToClerkUser));
    if (batch.length < limit) {
      break;
    }

    offset += limit;
  }

  return allUsers;
}
