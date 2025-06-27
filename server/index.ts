import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeWebSocketService } from "./services/websocketService";
import { messageService } from "./services/messageService";
import { cacheService } from "./services/cacheService";
import { dbManager } from './db';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Export app for testing
export { app };

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // CRITICAL FIX: Initialize database manager FIRST
  try {
    await dbManager.init();
    log("✅ Database Manager initialized successfully");
  } catch (error) {
    log("❌ Database initialization failed - continuing with limited functionality");
    console.error("Database error:", error);
  }

  const server = await registerRoutes(app);

  // Initialize WebSocket service
  const websocketService = initializeWebSocketService(server);
  log("WebSocket service initialized");

  // Initialize message service (Kafka) - make it optional
  try {
    await messageService.connect();
    log("Message service (Kafka) connected");
  } catch (error) {
    log("Warning: Message service (Kafka) connection failed - continuing without messaging");
    // Don't log full Kafka errors to reduce noise
  }

  // Test cache service (Redis) - make it optional
  try {
    const cacheHealthy = await cacheService.healthCheck();
    if (cacheHealthy) {
      log("Cache service (Redis) connected");
    } else {
      log("Warning: Cache service (Redis) not available - continuing without caching");
    }
  } catch (error) {
    log("Warning: Cache service (Redis) connection failed - continuing without caching");
  }

  // Initialize enterprise services AFTER database is ready
  try {
    const { notificationService } = await import('./services/notificationService');
    log("Notification service initialized:", notificationService.getHealth().status);
  } catch (error) {
    log("Warning: Notification service failed to initialize - continuing without notifications");
  }

  try {
    const { pricingService } = await import('./services/pricingService');
    log("Pricing service initialized:", pricingService.getHealth().status);
  } catch (error) {
    log("Warning: Pricing service failed to initialize - continuing without pricing");
  }

  let auditService: any = null;
  try {
    const auditModule = await import('./services/auditService');
    auditService = auditModule.auditService;
    log("Audit service initialized:", auditService.getHealth().status);
  } catch (error) {
    log("Warning: Audit service failed to initialize - continuing without auditing");
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ 
      success: false,
      error: {
        message,
        code: err.code || 'INTERNAL_ERROR'
      }
    });
    // Don't throw after sending response
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  // Serve the app on configurable port (default 3344 for development)
  // this serves both the API and the client.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3344;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    log('SIGTERM received, shutting down gracefully');
    try {
      await messageService.disconnect();
      await cacheService.close();
      if (auditService) await auditService.shutdown();
      log('Services disconnected successfully');
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    log('SIGINT received, shutting down gracefully');
    try {
      await messageService.disconnect();
      await cacheService.close();
      if (auditService) await auditService.shutdown();
      log('Services disconnected successfully');
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
    process.exit(0);
  });
})();
