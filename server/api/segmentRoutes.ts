import express, { Router } from "express";
import { storage } from "../storage";
import { requireAuth, handleApiError, AuthenticatedRequest } from "./index";
import { insertSegmentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { predictSegmentFromText } from "../services/openai";

export function registerSegmentRoutes(): Router {
  const router = express.Router();
  
  // Apply auth middleware
  router.use(requireAuth);
  
  // Get all segments for the current user
  router.get("/", async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const segments = await storage.getSegmentsByUserId(req.user.id);
      res.json(segments);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific segment
  router.get("/:id", async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid segment ID" });
      }
      
      const segment = await storage.getSegment(id);
      if (!segment) {
        return res.status(404).json({ message: "Segment not found" });
      }
      
      // Only allow access to own segments
      if (segment.createdById !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(segment);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new segment
  router.post("/", async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Validate segment data
      const segmentData = insertSegmentSchema.parse({
        ...req.body,
        createdById: req.user.id
      });
      
      // Create the segment
      const segment = await storage.createSegment(segmentData);
      
      res.status(201).json(segment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid segment data", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Preview audience size for a segment
  router.post("/preview", async (req: AuthenticatedRequest, res, next) => {
    try {
      const rules = req.body.rules;
      if (!rules) {
        return res.status(400).json({ message: "Rules are required" });
      }
      
      const customers = await storage.getCustomersInSegment(rules);
      
      res.json({
        audienceSize: customers.length
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Generate segment rules from natural language
  router.post("/generate-from-text", async (req: AuthenticatedRequest, res, next) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text prompt is required" });
      }
      
      // Use OpenAI to convert text to segment rules
      const segmentRules = await predictSegmentFromText(text);
      
      // Preview audience size with these rules
      const customers = await storage.getCustomersInSegment(segmentRules);
      
      res.json({
        rules: segmentRules,
        audienceSize: customers.length
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Error handling middleware
  router.use(handleApiError);
  
  return router;
}
