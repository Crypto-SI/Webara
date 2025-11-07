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
  projectTitle: z
    .string()
    .describe('A short, descriptive name for the project (max 80 characters).'),
  projectSummary: z
    .string()
    .describe('A concise summary (1-2 sentences) that highlights the requested outcomes.'),
  quote: z
    .string()
    .describe('The AI-generated quote with deliverables, timeline, and context.'),
  suggestedCollaboration: z
    .string()
    .describe('Suggested collaboration options based on the project scope and user preferences.'),
  estimatedCost: z
    .number()
    .describe('Primary estimated investment expressed as a number without currency symbols.'),
  currency: z
    .string()
    .describe('Three-letter ISO currency code inferred from the request (defaults to USD).'),
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

  Return ONLY valid JSON that matches this schema exactly:
  {
    "projectTitle": "short descriptive name (<= 80 characters)",
    "projectSummary": "1-2 sentence summary of the requested work",
    "quote": "Detailed cost narrative with deliverables, timeline, and benefits",
    "suggestedCollaboration": "Best-fit collaboration approach and rationale",
    "estimatedCost": number (no currency symbols, average if given a range),
    "currency": "ISO-4217 currency code such as USD, EUR, GBP. Default to USD if unsure."
  }

  When inferring the estimatedCost:
  - If the budget is a range, average the numeric values.
  - If the budget is missing or vague, calculate a realistic industry estimate that matches the described scope.
  - Never include commas or symbols, just the numeric value with decimals if needed.

  Use the provided budget text to infer the currency when possible; otherwise, use USD.

  Website Needs: {{{websiteNeeds}}}
  Collaboration Preferences: {{{collaborationPreferences}}}
  Budget: {{{budget}}}`,
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
