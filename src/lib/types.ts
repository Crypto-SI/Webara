import { z } from 'zod';

export const QuoteFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  websiteNeeds: z
    .string()
    .min(10, { message: 'Please describe your needs in at least 10 characters.' }),
  collaborationPreferences: z.string().optional(),
  budget: z.string().optional(),
});

export type QuoteFormValues = z.infer<typeof QuoteFormSchema>;
