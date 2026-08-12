// api/index.js
import { createExpressApp } from '../server/index.ts';

const app = createExpressApp();

// Export the Express app for Vercel
export default app;