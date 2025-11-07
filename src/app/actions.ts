
'use server';

import { auth } from '@clerk/nextjs/server';
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
import type { Database } from '@/lib/database.types';

type QuoteRow = Database['public']['Tables']['quotes']['Row'];
type QuoteInsert = Database['public']['Tables']['quotes']['Insert'];

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
      .insert(insertPayload)
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
