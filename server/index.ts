import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Log important environment variables (without revealing secrets)
console.log("Environment:", process.env.NODE_ENV);
console.log("Google OAuth configured:", !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET);
console.log("OpenAI API configured:", !!process.env.OPENAI_API_KEY);

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

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error but don't expose sensitive details in production
    console.error(`Error ${status}: ${message}`);
    if (process.env.NODE_ENV !== "production") {
      console.error(err.stack);
    }

    // Send a JSON response for API routes, HTML for others
    if (_req.path.startsWith('/api')) {
      res.status(status).json({ message });
    } else {
      // For non-API routes, we could serve a nice error page
      res.status(status).send(`
        <html>
          <head><title>Error ${status}</title></head>
          <body>
            <h1>Error ${status}</h1>
            <p>${message}</p>
            <a href="/">Go back to home</a>
          </body>
        </html>
      `);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // In production, serve the static files
    log("Running in production mode, serving static files");
    serveStatic(app);
  }

  // Use port from environment or default to 3000
  // this serves both the API and the client.
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
