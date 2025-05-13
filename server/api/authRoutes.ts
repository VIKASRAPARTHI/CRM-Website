import express, { Router } from "express";
import passport from "passport";
import { requireAuth, handleApiError, AuthenticatedRequest } from "./index";
import { storage } from "../storage";
import bcrypt from "bcryptjs";

export function registerAuthRoutes(): Router {
  const router = express.Router();

  // Email/password login endpoint
  router.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find the user by email
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password (assuming we store hashed passwords)
      if (user.password) {
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid email or password" });
        }
      } else {
        // This user was created via Google OAuth and doesn't have a password
        return res.status(401).json({
          message: "This account doesn't have a password. Please sign in with Google."
        });
      }

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }

        console.log("User logged in successfully:", user.id);

        // Return user info with authenticated flag
        res.json({
          ...user,
          authenticated: true
        });
      });
    } catch (error) {
      next(error);
    }
  });

  // Registration endpoint
  router.post("/register", async (req, res, next) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
      });

      // Log in the newly created user
      req.login(user, (err) => {
        if (err) {
          console.error("Registration login error:", err);
          return next(err);
        }

        console.log("New user registered and logged in successfully:", user.id);

        // Return user info with authenticated flag and 201 status
        res.status(201).json({
          ...user,
          authenticated: true
        });
      });
    } catch (error) {
      next(error);
    }
  });

  // Google OAuth login routes
  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  // Google OAuth callback
  router.get(
    "/google/callback",
    (req, res, next) => {
      console.log("Google OAuth callback received", req.query);

      // Check for error in the callback
      if (req.query.error) {
        console.error("Google OAuth error:", req.query.error);
        return res.redirect(`/auth?error=${encodeURIComponent(req.query.error as string)}`);
      }

      // Custom authenticate handler to catch errors
      passport.authenticate("google", { session: true }, (err, user, info) => {
        if (err) {
          console.error("Authentication error:", err);
          return res.redirect("/auth?error=authentication_failed");
        }

        if (!user) {
          console.error("No user returned from Google auth", info);
          return res.redirect("/auth?error=user_not_found");
        }

        // Log in the user
        req.login(user, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.redirect("/auth?error=login_failed");
          }

          console.log("Authentication successful for user:", user.id);

          // Redirect to home page with a success parameter
          return res.redirect("/?login=success");
        });
      })(req, res, next);
    }
  );

  // Get current authenticated user
  router.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
    res.json(req.user);
  });

  // Check if user is authenticated
  router.get("/check", (req, res) => {
    console.log("Auth check request received, session ID:", req.sessionID);
    console.log("Is authenticated:", req.isAuthenticated());

    if (req.isAuthenticated()) {
      console.log("User is authenticated, user ID:", (req.user as any)?.id);
      return res.json({
        authenticated: true,
        user: req.user,
        sessionID: req.sessionID
      });
    }

    console.log("User is not authenticated");
    res.json({
      authenticated: false,
      sessionID: req.sessionID
    });
  });

  // Logout
  router.post("/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.json({ success: true });
    });
  });

  // Error handling middleware
  router.use(handleApiError);

  return router;
}
