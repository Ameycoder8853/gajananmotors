import { yourFlow } from '@/genkit/yourFlow';
import { appRoute } from '@genkit-ai/next'; // if your version exports appRoute

export const POST = appRoute(yourFlow);
