import { defineFlow } from 'genkit';

export const myFlow = defineFlow('myFlow', async (input) => {
  return `Hello ${input.name}!`;
});
