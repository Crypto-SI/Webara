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
  
export type QuoteStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Call Requested';

export type MyQuote = {
  id: string;
  title: string;
  summary: string;
  quote: string;
  suggestedCollaboration: string;
  suggestions: string[];
  status: QuoteStatus;
};


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
  data: MyQuote[] | null;
  error: string | null;
}> {
  // This is a placeholder. In a real application, you would fetch
  // the user's quotes from your Supabase database.
  // This requires user authentication, which is not implemented here.

  // For demonstration purposes, we'll return some mock data.
  const mockQuotes: MyQuote[] = [
    {
      id: 'quote-1',
      title: 'E-commerce Site for Clothing Brand',
      summary: 'Quote for e-commerce site: $10,000. Suggested collaboration: 10% revenue share.',
      quote:
        'Based on your needs for a 5-page e-commerce site, we estimate a project cost of $10,000. This includes design, development, and basic SEO setup.',
      suggestedCollaboration:
        'A 10% revenue share model would be an excellent fit, aligning our success with yours.',
      suggestions: [
        'Offer a subscription box for curated outfits.',
        'Implement a customer loyalty program with exclusive discounts.',
        'Partner with influencers for social media marketing campaigns.',
      ],
      status: 'Accepted'
    },
    {
      id: 'quote-2',
      title: 'Portfolio Site for Photographer',
      summary: 'Quote for portfolio site: $2,500. Suggested collaboration: Fixed price.',
      quote:
        'For a professional portfolio website to showcase your photography, we propose a fixed price of $2,500. This covers a custom design with up to 5 gallery pages.',
      suggestedCollaboration:
        'A fixed-price project is ideal for this scope, providing clear deliverables and a set budget.',
      suggestions: [
        'Integrate a blog to share stories behind your photos.',
        'Sell prints directly from your website.',
        'Offer online workshops or tutorials.',
      ],
      status: 'Pending'
    },
    {
      id: 'quote-3',
      title: 'Mobile App for Food Delivery',
      summary: 'Quote for mobile app design: $15,000. Suggested collaboration: Price per lead.',
      quote:
        'The design and prototyping for a food delivery mobile app is estimated at $15,000. This includes user flow mapping, UI/UX design, and interactive prototypes.',
      suggestedCollaboration:
        'A price-per-lead model could be effective post-launch, where we earn a commission for each restaurant that signs up through the app.',
      suggestions: [
        'Gamify the ordering experience with points and rewards.',
        'Feature a "chef\'s special" of the day from partner restaurants.',
        'Allow users to create and share custom food collections.',
      ],
      status: 'Rejected'
    },
     {
      id: 'quote-4',
      title: 'Corporate Website Redesign',
      summary: 'Quote for corporate website redesign: $8,000. Collaboration: Fixed price.',
      quote: 'A complete redesign of your corporate website is estimated at $8,000. This includes a modern UI/UX, mobile optimization, and a content management system.',
      suggestedCollaboration: 'A fixed-price engagement is recommended to ensure budget and timeline adherence.',
      suggestions: [
        'Add an interactive timeline of the company\'s history.',
        'Create a dedicated careers portal with an online application system.',
        'Develop a resource center with case studies and whitepapers.',
      ],
      status: 'Call Requested',
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: mockQuotes, error: null });
    }, 1000);
  });
}


export async function getQuoteDetailsAction(id: string): Promise<{
  success: boolean;
  data: MyQuote | null;
  error: string | null;
}> {
  // This is a placeholder. In a real app, you would fetch from Supabase.
  const result = await getMyQuotesAction();
  if (result.success && result.data) {
    const quote = result.data.find(q => q.id === id);
    if (quote) {
      return { success: true, data: quote, error: null };
    }
  }
  return { success: false, data: null, error: "Quote not found." };
}
