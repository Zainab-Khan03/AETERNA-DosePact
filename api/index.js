// api/index.js
import { createExpressApp } from '../server/index.js';

const app = createExpressApp();

// Export the Express app for Vercel
export default app;