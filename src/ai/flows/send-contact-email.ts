
'use server';

/**
 * @fileOverview A Genkit flow to send a contact form submission as an email.
 *
 * - sendContactEmail - A function that handles processing and sending the contact email.
 * - ContactEmailInput - The input type for the sendContactEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RECIPIENT_EMAIL = 'amey35195@gmail.com';

// Define the schema for the contact form input. This is NOT exported.
const ContactEmailInputSchema = z.object({
  name: z.string().describe('The name of the person sending the message.'),
  email: z.string().email().describe('The email address of the sender.'),
  subject: z.string().describe('The subject of the message.'),
  message: z.string().describe('The content of the message.'),
});

// The type can be exported.
export type ContactEmailInput = z.infer<typeof ContactEmailInputSchema>;

// Define the prompt for the AI to generate the email content
const emailPrompt = ai.definePrompt({
  name: 'contactEmailPrompt',
  input: { schema: ContactEmailInputSchema },
  prompt: `
    You are an AI assistant responsible for forwarding contact form submissions to the site administrator.
    Generate a plain text email. Do not use Markdown or HTML.

    The email should be addressed to the site administrator.
    It must contain all the information from the user's submission.

    Here is the submission data:
    - From: {{{name}}} <{{{email}}}>
    - Subject: {{{subject}}}

    Message Body:
    {{{message}}}

    ---
    End of message.
  `,
});

// Define the flow that sends the email
const sendContactEmailFlow = ai.defineFlow(
  {
    name: 'sendContactEmailFlow',
    inputSchema: ContactEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    // Use the AI to generate the email body based on the prompt
    const { text } = await emailPrompt(input);

    // This is a placeholder for sending an email.
    // In a real application, you would use a transactional email service
    // like SendGrid, Resend, or AWS SES here.
    // For this example, we log the action to simulate sending an email.
    console.log('====================================');
    console.log('Simulating sending email:');
    console.log(`To: ${RECIPIENT_EMAIL}`);
    console.log(`From: noreply@gajananmotors.com (via Contact Form)`);
    console.log(`Reply-To: ${input.name} <${input.email}>`);
    console.log(`Subject: [Gajanan Contact Form] ${input.subject}`);
    console.log('---');
    console.log(text);
    console.log('====================================');

    // Since we are simulating, we resolve without returning a value.
    return;
  }
);

// Export a wrapper function to be called from the client
export async function sendContactEmail(input: ContactEmailInput): Promise<void> {
  await sendContactEmailFlow(input);
}
