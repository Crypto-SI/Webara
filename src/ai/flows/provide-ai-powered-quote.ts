'use server';
/**
 * @fileOverview An AI-powered quote generator for web design needs.
 *
 * - provideAiPoweredQuote - A function that generates a quote based on user input.
 * - QuoteInput - The input type for the provideAiPoweredQuote function.
 * - QuoteOutput - The return type for the provideAiPoweredQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuoteInputSchema = z.object({
  websiteNeeds: z.string().describe('The specific needs and requirements for the website design.'),
  collaborationPreferences: z.string().describe('The preferred collaboration options (e.g., revenue sharing, price per lead).'),
  budget: z.string().describe('The budget for the project.'),
});
export type QuoteInput = z.infer<typeof QuoteInputSchema>;

const QuoteOutputSchema = z.object({
  quote: z.string().describe('The AI-generated quote based on the input requirements.'),
  suggestedCollaboration: z.string().describe('Suggested collaboration options based on the project scope and user preferences.'),
});
export type QuoteOutput = z.infer<typeof QuoteOutputSchema>;

export async function provideAiPoweredQuote(input: QuoteInput): Promise<QuoteOutput> {
  return provideAiPoweredQuoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiPoweredQuotePrompt',
  input: {schema: QuoteInputSchema},
  output: {schema: QuoteOutputSchema},
  prompt: `You are an AI assistant designed to provide quotes and collaboration suggestions for web design projects.

  Based on the user's input, provide a detailed quote for their web design needs and suggest suitable collaboration options.
  Consider the project scope, budget, and collaboration preferences to generate an optimal solution.

  Website Needs: {{{websiteNeeds}}}
  Collaboration Preferences: {{{collaborationPreferences}}}
  Budget: {{{budget}}}

  Quote: 
  Suggested Collaboration Options: `,
});

const provideAiPoweredQuoteFlow = ai.defineFlow(
  {
    name: 'provideAiPoweredQuoteFlow',
    inputSchema: QuoteInputSchema,
    outputSchema: QuoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
