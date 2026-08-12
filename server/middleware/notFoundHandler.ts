// server/middleware/notFoundHandler.ts
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  // Only handle API routes and static assets that weren't found
  // For SPA routes, let the frontend handle it
  if (req.path.startsWith('/api') || req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    const acceptsHtml = req.headers.accept?.includes('text/html');
    
    if (acceptsHtml) {
      // Serve custom 404 HTML page for static assets
      const publicDir = path.join(process.cwd(), 'public');
      const indexPath = path.join(publicDir, '404.html');
      
      if (fs.existsSync(indexPath)) {
        res.status(404).sendFile(indexPath);
      } else {
        // Fallback inline 404 page
        res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Page Not Found | AETERNA DosePact</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: system-ui, -apple-system, sans-serif;
                background: #f5f2ed;
                color: #292521;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                text-align: center;
                background: white;
                padding: 60px 40px;
                border-radius: 20px;
                box-shadow: 0 10px 40px rgba(41, 37, 33, 0.08);
              }
              .code {
                font-size: 120px;
                font-weight: 800;
                line-height: 1;
                background: linear-gradient(135deg, #292521 0%, #6b655f 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              }
              .title { font-size: 28px; font-weight: 700; margin: 20px 0 12px; }
              .description { font-size: 16px; color: #6b655f; line-height: 1.7; margin-bottom: 30px; }
              .btn {
                display: inline-block;
                padding: 14px 36px;
                background: #292521;
                color: white;
                text-decoration: none;
                border-radius: 12px;
                font-weight: 600;
                transition: all 0.3s ease;
              }
              .btn:hover {
                background: #4a4440;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(41, 37, 33, 0.2);
              }
              .links { margin-top: 24px; display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
              .links a { color: #6b655f; text-decoration: none; font-size: 14px; }
              .links a:hover { color: #292521; text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="code">404</div>
              <h1 class="title">Page Not Found</h1>
              <p class="description">
                Oops! The page you're looking for doesn't exist or has been moved.
                Let's get you back on track with your medication routine.
              </p>
              <a href="/" class="btn">🏠 Return to Dashboard</a>
              <div class="links">
                <a href="/dashboard">Dashboard</a>
                <a href="/cabinet">Medication Cabinet</a>
                <a href="/schedule">Schedule</a>
              </div>
            </div>
          </body>
          </html>
        `);
      }
    } else {
      // JSON response for API requests
      res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource does not exist',
        status: 404,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      });
    }
  } else {
    // For SPA routes, redirect to index.html (let React Router handle it)
    const frontendBuildPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(frontendBuildPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // If no build exists, serve the 404 page
      res.status(404).sendFile(path.join(process.cwd(), 'public', '404.html'));
    }
  }
};