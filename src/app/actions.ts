'use server';

import {
  provideAiPoweredQuote,
  type QuoteOutput,
} from '@/ai/flows/provide-ai-powered-quote';
import { QuoteFormSchema, type QuoteFormValues } from '@/lib/types';

export async function getAiQuoteAction(
  values: QuoteFormValues
): Promise<{
  success: boolean;
  data: QuoteOutput | null;
  error: string | null;
}> {
  const parsed = QuoteFormSchema.safeParse(values);

  if (!parsed.success) {
    return { success: false, data: null, error: 'Invalid form data.' };
  }

  try {
    const aiResponse = await provideAiPoweredQuote({
      websiteNeeds: parsed.data.websiteNeeds,
      collaborationPreferences:
        parsed.data.collaborationPreferences || 'Not specified',
      budget: parsed.data.budget || 'Not specified',
    });

    return { success: true, data: aiResponse, error: null };
  } catch (error) {
    console.error('AI quote generation failed:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to generate AI quote. Please try again later.',
    };
  }
}
