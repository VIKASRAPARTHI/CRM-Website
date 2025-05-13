import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { registerCustomerRoutes } from "./api/customerRoutes";
import { registerOrderRoutes } from "./api/orderRoutes";
import { registerCampaignRoutes } from "./api/campaignRoutes";
import { registerSegmentRoutes } from "./api/segmentRoutes";
import { registerAuthRoutes } from "./api/authRoutes";
import { setupRedis } from "./services/redis";
import memorystore from 'memorystore';
import swaggerUi from 'swagger-ui-express';

// Configure session store
const MemoryStore = memorystore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Redis for pub-sub
  await setupRedis();

  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "xeno-crm-secret",
      resave: false,
      saveUninitialized: true, // Changed to true to ensure session is saved
      cookie: {
        secure: false, // Set to false for local development
        maxAge: 86400000, // 1 day
        httpOnly: true,
        sameSite: 'lax' // Helps with CSRF protection
      },
      store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      })
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport Google OAuth
  console.log("Setting up Google OAuth with clientID:", process.env.GOOGLE_CLIENT_ID ? "Provided" : "Not Provided");

  // Get the callback URL from env or construct a default one
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback";

  // For Google OAuth console configuration, the full URL is needed
  const fullCallbackURL = `${process.env.APP_BASE_URL}${callbackURL}`;
  console.log("Full OAuth callback URL (for Google Console):", fullCallbackURL);

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
        callbackURL: callbackURL,  // We use the relative URL here
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google auth profile received:", {
            id: profile.id,
            displayName: profile.displayName,
            emails: profile.emails?.map(e => e.value),
            photos: profile.photos?.map(p => p.value),
          });

          let user = await storage.getUserByGoogleId(profile.id);

          if (!user) {
            // Create a new user if they don't exist
            console.log("Creating new user from Google profile");
            user = await storage.createUser({
              username: profile.displayName.replace(/\s+/g, "").toLowerCase(),
              email: profile.emails?.[0]?.value || `${profile.id}@example.com`,
              googleId: profile.id,
              displayName: profile.displayName,
              pictureUrl: profile.photos?.[0]?.value,
            });
          } else {
            console.log("Found existing user:", user.id);
          }

          return done(null, user);
        } catch (error) {
          console.error("Google auth error:", error);
          return done(error as Error);
        }
      }
    )
  );

  // Serialize and deserialize user for sessions
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register API routes (all prefixed with /api)
  app.use("/api/auth", registerAuthRoutes());
  app.use("/api/customers", registerCustomerRoutes());
  app.use("/api/orders", registerOrderRoutes());
  app.use("/api/segments", registerSegmentRoutes());
  app.use("/api/campaigns", registerCampaignRoutes());

  // Swagger UI for API documentation
  const swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Mini CRM API',
      version: '1.0.0',
      description: 'API documentation for the Mini CRM platform'
    },
    servers: [
      {
        url: '/api',
        description: 'API Server'
      }
    ],
    paths: {
      // Auth endpoints
      '/auth/google': {
        get: {
          summary: 'Google OAuth login',
          tags: ['Auth']
        }
      },
      '/auth/google/callback': {
        get: {
          summary: 'Google OAuth callback',
          tags: ['Auth']
        }
      },
      '/auth/me': {
        get: {
          summary: 'Get current user',
          tags: ['Auth']
        }
      },
      '/auth/logout': {
        post: {
          summary: 'Logout user',
          tags: ['Auth']
        }
      },

      // Customer endpoints
      '/customers': {
        get: {
          summary: 'Get all customers',
          tags: ['Customers']
        },
        post: {
          summary: 'Create a new customer',
          tags: ['Customers']
        }
      },

      // Order endpoints
      '/orders': {
        get: {
          summary: 'Get all orders',
          tags: ['Orders']
        },
        post: {
          summary: 'Create a new order',
          tags: ['Orders']
        }
      },

      // Segment endpoints
      '/segments': {
        get: {
          summary: 'Get all segments',
          tags: ['Segments']
        },
        post: {
          summary: 'Create a new segment',
          tags: ['Segments']
        }
      },

      // Campaign endpoints
      '/campaigns': {
        get: {
          summary: 'Get all campaigns',
          tags: ['Campaigns']
        },
        post: {
          summary: 'Create a new campaign',
          tags: ['Campaigns']
        }
      },
      '/campaigns/{id}/send': {
        post: {
          summary: 'Send a campaign',
          tags: ['Campaigns']
        }
      }
    }
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
