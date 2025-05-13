import express, { Router } from "express";
import { storage } from "../storage";
import { requireAuth, handleApiError } from "./index";
import { insertOrderSchema } from "@shared/schema";
import { publishMessage } from "../services/redis";
import { ZodError } from "zod";

export function registerOrderRoutes(): Router {
  const router = express.Router();
  
  // Apply auth middleware
  router.use(requireAuth);
  
  // Get all orders
  router.get("/", async (req, res, next) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });
  
  // Get a specific order
  router.get("/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  });
  
  // Get orders for a specific customer
  router.get("/customer/:customerId", async (req, res, next) => {
    try {
      const customerId = parseInt(req.params.customerId);
      if (isNaN(customerId)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      const orders = await storage.getOrdersByCustomerId(customerId);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });
  
  // Create a new order
  router.post("/", async (req, res, next) => {
    try {
      // Validate order data
      const orderData = insertOrderSchema.parse(req.body);
      
      // Check if customer exists
      const customer = await storage.getCustomer(orderData.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Publish order creation message to Redis
      await publishMessage('order:create', orderData);
      
      res.status(202).json({ message: "Order creation request accepted" });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Direct API endpoint for testing/immediate feedback
  router.post("/direct", async (req, res, next) => {
    try {
      // Validate order data
      const orderData = insertOrderSchema.parse(req.body);
      
      // Check if customer exists
      const customer = await storage.getCustomer(orderData.customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      // Directly create the order
      const order = await storage.createOrder(orderData);
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Error handling middleware
  router.use(handleApiError);
  
  return router;
}
