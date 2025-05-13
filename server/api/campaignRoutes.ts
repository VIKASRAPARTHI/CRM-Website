import express, { Router } from "express";
import { storage } from "../storage";
import { requireAuth, handleApiError, AuthenticatedRequest } from "./index";
import { insertCampaignSchema } from "@shared/schema";
import { ZodError } from "zod";
import { sendCampaign } from "../services/messageService";
import { generateMessageSuggestions, generateCampaignSummary } from "../services/openai";

export function registerCampaignRoutes(): Router {
  const router = express.Router();
  
  // Apply auth middleware
  router.use(requireAuth);
  
  // Get all campaigns for the current user
  router.get("/", async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const campaigns = await storage.getCampaignsByUserId(req.user.id);
      res.json(campaigns);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific campaign
  router.get("/:id", async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Only allow access to own campaigns
      if (campaign.createdById !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(campaign);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new campaign
  router.post("/", async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Validate campaign data
      const campaignData = insertCampaignSchema.parse({
        ...req.body,
        createdById: req.user.id
      });
      
      // Check if segment exists
      const segment = await storage.getSegment(campaignData.segmentId);
      if (!segment) {
        return res.status(404).json({ message: "Segment not found" });
      }
      
      // Create the campaign
      const campaign = await storage.createCampaign(campaignData);
      
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid campaign data", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Send a campaign
  router.post("/:id/send", async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Only allow sending own campaigns
      if (campaign.createdById !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if campaign is already sent
      if (campaign.status === 'sent') {
        return res.status(400).json({ message: "Campaign already sent" });
      }
      
      // Update campaign status
      const updatedCampaign = await storage.updateCampaign(id, {
        status: 'sending',
        sentAt: new Date()
      });
      
      // Start sending the campaign in the background
      sendCampaign(campaign).catch(error => {
        console.error(`Error sending campaign ${campaign.id}:`, error);
      });
      
      res.json({
        message: "Campaign sending initiated",
        campaign: updatedCampaign
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Get communication logs for a campaign
  router.get("/:id/logs", async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid campaign ID" });
      }
      
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // Only allow access to own campaign logs
      if (campaign.createdById !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const logs = await storage.getCommunicationLogsByCampaignId(id);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  });
  
  // Generate AI message suggestions
  router.post("/generate-message", async (req: AuthenticatedRequest, res, next) => {
    try {
      const { objective, segmentInfo } = req.body;
      
      if (!objective) {
        return res.status(400).json({ message: "Campaign objective is required" });
      }
      
      const suggestions = await generateMessageSuggestions(objective, segmentInfo);
      res.json(suggestions);
    } catch (error) {
      next(error);
    }
  });
  
  // Generate AI campaign summary
  router.post("/generate-summary", async (req: AuthenticatedRequest, res, next) => {
    try {
      const { campaign, logs } = req.body;
      
      if (!campaign) {
        return res.status(400).json({ message: "Campaign data is required" });
      }
      
      const summary = await generateCampaignSummary(campaign, logs || []);
      res.json({ summary });
    } catch (error) {
      next(error);
    }
  });

  // Error handling middleware
  router.use(handleApiError);
  
  return router;
}
