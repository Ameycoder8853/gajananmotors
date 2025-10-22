// src/app/api/genkit/[[...path]]/route.ts

// 1. Import the configuration tool from the CORE 'genkit' package
import { configureGenkit } from 'genkit'; 

// 2. Import the API handler utility from the Next.js ADAPTER package
import { createGenkitNextApi } from '@genkit-ai/next';

// 3. Import your flows (adjust the path as needed)
import * as flows from '../../../../genkit/flows'; 

// 4. Configure Genkit
configureGenkit({
  // ... your model plugins, logging, etc. here
  // e.g., plugins: [googleGenAI({ apiKey: process.env.GEMINI_API_KEY })],
});

// 5. Use the correct function (`createGenkitNextApi`) to create the Next.js handler
export const { GET, POST } = createGenkitNextApi({ 
    flows, // Pass your flow definitions
});
