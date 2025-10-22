import { genkit } from '@genkit-ai/next';  // if genkit is the correct export
// or
import { appRoute } from '@genkit-ai/next'; // if using the next plugin example

export const { GET, POST } = appRoute(genkitFlow);
