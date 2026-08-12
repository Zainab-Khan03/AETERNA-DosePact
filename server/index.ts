// server/index.ts
import { createExpressApp } from './app.js';
import { verifyEmailConnection } from './emailService.js';
import type { Express } from 'express';

let app: Express | null = null;
const PORT = process.env.PORT || 3000;

// Initialize and start server
(async () => {
  app = await createExpressApp();

  // Start server
  const server = app.listen(PORT, async () => {
    console.log(`\n🚀 [AETERNA DosePact Server] Listening on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
    console.log(`❤️  Health check at http://localhost:${PORT}/api/health\n`);

    // Verify email connection on startup
    await verifyEmailConnection();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[AETERNA DosePact Server] Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      console.log('[AETERNA DosePact Server] Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('[AETERNA DosePact Server] Received SIGINT, shutting down gracefully...');
    server.close(() => {
      console.log('[AETERNA DosePact Server] Server closed');
      process.exit(0);
    });
  });
})();

export default app;