
'use server';

/**
 * @fileOverview A Genkit flow to send a contact form submission as an email using Resend.
 *
 * - sendContactEmail - A function that handles processing and sending the contact email.
 * - ContactEmailInput - The input type for the sendContactEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';

const RECIPIENT_EMAIL = 'amey35195@gmail.com';
const FROM_EMAIL = 'onboarding@resend.dev'; // Resend requires a verified domain or allows this for testing.

const ContactEmailInputSchema = z.object({
  name: z.string().describe('The name of the person sending the message.'),
  email: z.string().email().describe('The email address of the sender.'),
  subject: z.string().describe('The subject of the message.'),
  message: z.string().describe('The content of the message.'),
});

export type ContactEmailInput = z.infer<typeof ContactEmailInputSchema>;

const emailPrompt = ai.definePrompt({
  name: 'contactEmailPrompt',
  input: { schema: ContactEmailInputSchema },
  prompt: `
    Generate a plain text email body. Do not use Markdown or HTML.

    The email is from a user of the Gajanan Motors website.
    Here is the submission data:
    - From: {{{name}}} <{{{email}}}>
    - Subject: {{{subject}}}

    Message Body:
    {{{message}}}

    ---
    End of message.
  `,
});

const sendContactEmailFlow = ai.defineFlow(
  {
    name: 'sendContactEmailFlow',
    inputSchema: ContactEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    // 1. Check if the API key is available
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set. Email will not be sent.');
      // Throw an error that the client-side can catch and display.
      throw new Error('Email service is not configured on the server.');
    }
    
    // 2. Initialize Resend inside the flow, only when it's needed.
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 3. Use the AI to generate the email body based on the prompt
    const { text } = await emailPrompt(input);

    // 4. Send the email using Resend
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: RECIPIENT_EMAIL,
        subject: `[Gajanan Contact Form] ${input.subject}`,
        text: text, // Use the AI-generated plain text
        reply_to: `${input.name} <${input.email}>`,
      });
      console.log(`Email sent successfully to ${RECIPIENT_EMAIL}`);
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      // Re-throw the error so the client-side can handle it
      throw new Error('Failed to send the email.');
    }

    return;
  }
);

// Export a wrapper function to be called from the client
export async function sendContactEmail(input: ContactEmailInput): Promise<void> {
  await sendContactEmailFlow(input);
}
