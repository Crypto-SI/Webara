'use server';

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

export type AiQuoteAndSuggestions = QuoteOutput &
  CollaborationSuggestionsOutput;

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

export async function getMyQuotesAction(): Promise<{
  success: boolean;
  data: string[] | null;
  error: string | null;
}> {
  // This is a placeholder. In a real application, you would fetch
  // the user's quotes from your Supabase database.
  // This requires user authentication, which is not implemented here.

  // For demonstration purposes, we'll return some mock data.
  const mockQuotes = [
    "Quote for e-commerce site: $10,000. Suggested collaboration: 10% revenue share.",
    "Quote for portfolio site: $2,500. Suggested collaboration: Fixed price.",
    "Quote for mobile app design: $15,000. Suggested collaboration: Price per lead.",
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: mockQuotes, error: null });
    }, 1000);
  });
}
