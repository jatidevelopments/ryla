/**
 * Health check endpoint for Fly.io
 */

import express, { Request, Response, Express } from 'express';

export function createHealthCheck(): Express {
  const app = express();

  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
    });
  });

  return app;
}
