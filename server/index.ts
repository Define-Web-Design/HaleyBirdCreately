import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Try to use port 5000 first, as that's what Replit expects
  // Fall back to a different port if 5000 is unavailable
  const tryPorts = [5000, 3000, 8080];
  let currentPortIndex = 0;
  
  function listenOnPort(portIndex: number) {
    const port = process.env.PORT ? parseInt(process.env.PORT) : tryPorts[portIndex];
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }).on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        currentPortIndex++;
        if (currentPortIndex < tryPorts.length) {
          log(`Port ${port} is in use, trying port ${tryPorts[currentPortIndex]} instead...`);
          listenOnPort(currentPortIndex);
        } else {
          log('All predefined ports are in use. Please free up a port or specify a different port via PORT env variable.');
          throw e;
        }
      } else {
        throw e;
      }
    }).on('listening', () => {
      log(`serving on port ${port}`);
    });
  }
  
  listenOnPort(currentPortIndex);
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
