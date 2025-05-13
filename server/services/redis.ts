import { storage } from "../storage";
import { InsertCustomer, InsertOrder } from "@shared/schema";

// Mock Redis functionality since we don't have actual Redis
const subscribers: Map<string, Function[]> = new Map();

// Set up Redis client and connection
export async function setupRedis() {
  console.log("Setting up Redis pub/sub system...");
  
  // Set up subscriptions
  subscribeToChannel('customer:create', handleCustomerCreate);
  subscribeToChannel('customer:update', handleCustomerUpdate);
  subscribeToChannel('order:create', handleOrderCreate);
  subscribeToChannel('message:deliveryReceipt', handleMessageDeliveryReceipt);
  
  console.log("Redis pub/sub system ready");
}

// Publish a message to a channel
export async function publishMessage(channel: string, message: any): Promise<void> {
  console.log(`Publishing message to channel ${channel}:`, message);
  
  // Get subscribers for this channel
  const channelSubscribers = subscribers.get(channel) || [];
  
  // Notify all subscribers asynchronously
  setTimeout(() => {
    channelSubscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error(`Error in subscriber callback for channel ${channel}:`, error);
      }
    });
  }, 0);
}

// Subscribe to a channel
export function subscribeToChannel(channel: string, callback: Function): void {
  const channelSubscribers = subscribers.get(channel) || [];
  channelSubscribers.push(callback);
  subscribers.set(channel, channelSubscribers);
}

// Handle customer creation
async function handleCustomerCreate(customerData: InsertCustomer) {
  try {
    console.log("Processing customer creation:", customerData);
    await storage.createCustomer(customerData);
    console.log("Customer created successfully");
  } catch (error) {
    console.error("Error creating customer:", error);
  }
}

// Handle customer update
async function handleCustomerUpdate({ id, data }: { id: number, data: Partial<any> }) {
  try {
    console.log(`Processing customer update for ID ${id}:`, data);
    await storage.updateCustomer(id, data);
    console.log("Customer updated successfully");
  } catch (error) {
    console.error("Error updating customer:", error);
  }
}

// Handle order creation
async function handleOrderCreate(orderData: InsertOrder) {
  try {
    console.log("Processing order creation:", orderData);
    await storage.createOrder(orderData);
    console.log("Order created successfully");
  } catch (error) {
    console.error("Error creating order:", error);
  }
}

// Handle message delivery receipts
async function handleMessageDeliveryReceipt(receipt: { 
  logId: number; 
  status: 'delivered' | 'failed'; 
  deliveredAt?: Date;
  failureReason?: string;
}) {
  try {
    console.log("Processing message delivery receipt:", receipt);
    
    // Update individual log
    await storage.updateCommunicationLog(receipt.logId, {
      status: receipt.status,
      deliveredAt: receipt.status === 'delivered' ? receipt.deliveredAt || new Date() : undefined,
      failureReason: receipt.status === 'failed' ? receipt.failureReason : undefined
    });
    
    console.log("Communication log updated successfully");
  } catch (error) {
    console.error("Error updating communication log:", error);
  }
}

// Handle message delivery receipts in batches
export async function processBatchDeliveryReceipts(receipts: { 
  logId: number; 
  status: 'delivered' | 'failed';
  deliveredAt?: Date;
  failureReason?: string;
}[]): Promise<void> {
  try {
    console.log(`Processing batch of ${receipts.length} delivery receipts`);
    
    // Group by status
    const deliveredIds = receipts
      .filter(r => r.status === 'delivered')
      .map(r => r.logId);
    
    const failedIds = receipts
      .filter(r => r.status === 'failed')
      .map(r => r.logId);
    
    // Update in batches
    if (deliveredIds.length > 0) {
      await storage.updateCommunicationLogsInBatch(deliveredIds, {
        status: 'delivered',
        deliveredAt: new Date()
      });
    }
    
    if (failedIds.length > 0) {
      await storage.updateCommunicationLogsInBatch(failedIds, {
        status: 'failed'
      });
    }
    
    console.log("Batch communication logs updated successfully");
  } catch (error) {
    console.error("Error updating batch communication logs:", error);
  }
}
