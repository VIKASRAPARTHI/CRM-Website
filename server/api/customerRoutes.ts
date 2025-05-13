import express, { Router } from "express";
import { storage } from "../storage";
import { requireAuth, handleApiError, AuthenticatedRequest } from "./index";
import { insertCustomerSchema } from "@shared/schema";
import { publishMessage } from "../services/redis";
import { ZodError } from "zod";

export function registerCustomerRoutes(): Router {
  const router = express.Router();
  
  // Apply auth middleware
  router.use(requireAuth);
  
  // Get all customers
  router.get("/", async (req, res, next) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific customer
  router.get("/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new customer
  router.post("/", async (req, res, next) => {
    try {
      // Validate customer data
      const customerData = insertCustomerSchema.parse(req.body);
      
      // Check if email already exists
      const existingCustomer = await storage.getCustomerByEmail(customerData.email);
      if (existingCustomer) {
        return res.status(409).json({ message: "Customer with this email already exists" });
      }
      
      // Instead of directly creating the customer, publish a message to Redis
      await publishMessage('customer:create', customerData);
      
      res.status(202).json({ message: "Customer creation request accepted" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Direct API endpoint for testing/immediate feedback
  router.post("/direct", async (req, res, next) => {
    try {
      // Validate customer data
      const customerData = insertCustomerSchema.parse(req.body);
      
      // Check if email already exists
      const existingCustomer = await storage.getCustomerByEmail(customerData.email);
      if (existingCustomer) {
        return res.status(409).json({ message: "Customer with this email already exists" });
      }
      
      // Directly create the customer
      const customer = await storage.createCustomer(customerData);
      
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Update a customer
  router.patch("/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Publish update message to Redis
      await publishMessage('customer:update', { id, data: req.body });
      
      res.status(202).json({ message: "Customer update request accepted" });
    } catch (error) {
      next(error);
    }
  });
  
  // Error handling middleware
  router.use(handleApiError);
  
  return router;
}
