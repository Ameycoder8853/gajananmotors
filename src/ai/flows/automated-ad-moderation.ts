'use server';

/**
 * @fileOverview An AI-powered ad moderation flow that checks car images and descriptions for policy violations.
 *
 * - moderateAdContent - A function that handles the ad moderation process.
 * - ModerateAdContentInput - The input type for the moderateAdContent function.
 * - ModerateAdContentOutput - The return type for the moderateAdContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateAdContentInputSchema = z.object({
  title: z.string().describe('The title of the ad.'),
  description: z.string().describe('The description of the ad.'),
  imageUrls: z.array(z.string()).describe('Array of URLs of the images in the ad.'),
});
export type ModerateAdContentInput = z.infer<typeof ModerateAdContentInputSchema>;

const ModerateAdContentOutputSchema = z.object({
  isViolation: z.boolean().describe('Whether the ad violates any policies.'),
  reason: z.string().describe('The reason for the violation, if any.'),
});
export type ModerateAdContentOutput = z.infer<typeof ModerateAdContentOutputSchema>;

export async function moderateAdContent(input: ModerateAdContentInput): Promise<ModerateAdContentOutput> {
  return moderateAdContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateAdContentPrompt',
  input: {schema: ModerateAdContentInputSchema},
  output: {schema: ModerateAdContentOutputSchema},
  prompt: `You are an AI-powered content moderator for a car marketplace.

You will receive the title, description and a list of image urls for a car ad.
Your task is to determine if the ad violates any policies.
Policies include:
- Inappropriate content (e.g., explicit, offensive, or illegal material).
- Attempts to bypass ad limits with deceptive wording.

Title: {{{title}}}
Description: {{{description}}}
Images:
{{#each imageUrls}}
  - {{this}}
{{/each}}

Based on the content of the title, description and images, determine if the ad violates any of these policies.
If it does, set isViolation to true and provide a detailed reason in the reason field.
If it does not, set isViolation to false and reason to 'No violation'.

Ensure that the reason is comprehensive and specific, citing the exact policy violated and how it was violated.

Response: {
  "isViolation": true/false,
  "reason": "Reason for violation or 'No violation' if none"
}`,
});

const moderateAdContentFlow = ai.defineFlow(
  {
    name: 'moderateAdContentFlow',
    inputSchema: ModerateAdContentInputSchema,
    outputSchema: ModerateAdContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
