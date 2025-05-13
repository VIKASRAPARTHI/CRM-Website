import { Request, Response, NextFunction } from "express";

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Error handling middleware
export function handleApiError(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.status(500).json({ message: "Internal server error", error: err.message });
}

// Type for authenticated request
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    displayName?: string;
  };
}
