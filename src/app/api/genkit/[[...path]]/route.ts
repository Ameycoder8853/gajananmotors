import { yourFlow } from '@app/api//genkit/yourFlow';
import { appRoute } from '@genkit-ai/next'; // if your version exports appRoute

export const POST = appRoute(yourFlow);
