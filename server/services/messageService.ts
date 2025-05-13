import { storage } from "../storage";
import { Campaign, Customer, CommunicationLog } from "@shared/schema";
import { publishMessage, processBatchDeliveryReceipts } from "./redis";

// Send a campaign to all target customers
export async function sendCampaign(campaign: Campaign): Promise<void> {
  try {
    console.log(`Starting to send campaign ${campaign.id}: ${campaign.name}`);
    
    // Get segment
    const segment = await storage.getSegment(campaign.segmentId);
    if (!segment) {
      throw new Error(`Segment ${campaign.segmentId} not found`);
    }
    
    // Get customers in segment
    const customers = await storage.getCustomersInSegment(segment.rules as any);
    console.log(`Found ${customers.length} customers in segment`);
    
    // Create communication logs for each customer
    const logs: CommunicationLog[] = [];
    for (const customer of customers) {
      // Personalize message
      const personalizedMessage = personalizeMessage(campaign.message, customer);
      
      // Create communication log
      const log = await storage.createCommunicationLog({
        campaignId: campaign.id,
        customerId: customer.id,
        message: personalizedMessage,
        status: 'pending'
      });
      
      logs.push(log);
    }
    
    // Update campaign with audience size
    await storage.updateCampaign(campaign.id, {
      audienceSize: customers.length,
      status: 'sending'
    });
    
    // Send messages in batches
    const batchSize = 10;
    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize);
      await sendMessageBatch(batch);
      
      // Small delay to simulate throttling
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Update campaign as sent
    await storage.updateCampaign(campaign.id, {
      status: 'sent'
    });
    
    console.log(`Completed sending campaign ${campaign.id}`);
  } catch (error) {
    console.error(`Error sending campaign ${campaign.id}:`, error);
    
    // Update campaign as failed
    await storage.updateCampaign(campaign.id, {
      status: 'failed'
    });
  }
}

// Send a batch of messages
async function sendMessageBatch(logs: CommunicationLog[]): Promise<void> {
  try {
    console.log(`Sending batch of ${logs.length} messages`);
    
    // Update logs as sending
    for (const log of logs) {
      await storage.updateCommunicationLog(log.id, {
        status: 'sending',
        sentAt: new Date()
      });
    }
    
    // Collect delivery receipts (simulate vendor API)
    const receipts = logs.map(log => {
      // Simulate 90% success, 10% failure rate
      const isDelivered = Math.random() < 0.9;
      
      return {
        logId: log.id,
        status: isDelivered ? 'delivered' : 'failed',
        deliveredAt: isDelivered ? new Date() : undefined,
        failureReason: isDelivered ? undefined : 'Failed to deliver message'
      };
    });
    
    // Process delivery receipts in batch
    await processBatchDeliveryReceipts(receipts);
    
    console.log(`Batch of ${logs.length} messages sent`);
  } catch (error) {
    console.error("Error sending message batch:", error);
  }
}

// Helper function to personalize message with customer data
function personalizeMessage(template: string, customer: Customer): string {
  return template
    .replace(/{{customer\.firstName}}/g, customer.firstName)
    .replace(/{{customer\.lastName}}/g, customer.lastName)
    .replace(/{{customer\.email}}/g, customer.email)
    .replace(/{{customer\.([^}]+)}}/g, (match, field) => {
      return (customer as any)[field] || match;
    });
}

// Handle a delivery receipt from the vendor API
export async function handleDeliveryReceipt(receipt: {
  logId: number;
  status: 'delivered' | 'failed';
}): Promise<void> {
  // Publish to Redis for asynchronous processing
  await publishMessage('message:deliveryReceipt', receipt);
}
