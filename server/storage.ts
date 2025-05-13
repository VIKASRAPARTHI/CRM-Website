import {
  users, User, InsertUser,
  customers, Customer, InsertCustomer,
  orders, Order, InsertOrder,
  segments, Segment, InsertSegment,
  campaigns, Campaign, InsertCampaign,
  communicationLogs, CommunicationLog, InsertCommunicationLog,
  RuleGroup
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, data: Partial<Customer>): Promise<Customer | undefined>;

  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByCustomerId(customerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;

  // Segment operations
  getSegments(): Promise<Segment[]>;
  getSegment(id: number): Promise<Segment | undefined>;
  getSegmentsByUserId(userId: number): Promise<Segment[]>;
  createSegment(segment: InsertSegment): Promise<Segment>;
  updateSegment(id: number, data: Partial<Segment>): Promise<Segment | undefined>;
  getCustomersInSegment(segmentRules: RuleGroup): Promise<Customer[]>;
  
  // Campaign operations
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByUserId(userId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined>;
  
  // Communication log operations
  getCommunicationLogs(): Promise<CommunicationLog[]>;
  getCommunicationLog(id: number): Promise<CommunicationLog | undefined>;
  getCommunicationLogsByCampaignId(campaignId: number): Promise<CommunicationLog[]>;
  createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog>;
  updateCommunicationLog(id: number, data: Partial<CommunicationLog>): Promise<CommunicationLog | undefined>;
  updateCommunicationLogsInBatch(ids: number[], data: Partial<CommunicationLog>): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private orders: Map<number, Order>;
  private segments: Map<number, Segment>;
  private campaigns: Map<number, Campaign>;
  private communicationLogs: Map<number, CommunicationLog>;
  
  private userId: number;
  private customerId: number;
  private orderId: number;
  private segmentId: number;
  private campaignId: number;
  private communicationLogId: number;
  
  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.orders = new Map();
    this.segments = new Map();
    this.campaigns = new Map();
    this.communicationLogs = new Map();
    
    this.userId = 1;
    this.customerId = 1;
    this.orderId = 1;
    this.segmentId = 1;
    this.campaignId = 1;
    this.communicationLogId = 1;
    
    // Add sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create a sample user
    this.createUser({
      username: 'demo',
      email: 'demo@example.com',
      googleId: '123456789',
      displayName: 'Demo User',
      pictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'
    });

    // Create sample customers
    for (let i = 1; i <= 50; i++) {
      this.createCustomer({
        firstName: `Customer ${i}`,
        lastName: `Last ${i}`,
        email: `customer${i}@example.com`,
        phone: `+91${9000000000 + i}`,
        status: i % 10 === 0 ? 'inactive' : 'active'
      });

      // Add some orders for each customer
      const numOrders = Math.floor(Math.random() * 5) + 1;
      for (let j = 1; j <= numOrders; j++) {
        const amount = Math.floor(Math.random() * 10000) + 1000;
        this.createOrder({
          customerId: i,
          orderDate: new Date(Date.now() - (Math.random() * 60 * 24 * 60 * 60 * 1000)),
          amount,
          status: 'completed',
          items: [
            { productId: Math.floor(Math.random() * 100) + 1, name: `Product ${j}`, price: amount / j, quantity: j }
          ]
        });
      }
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    
    // Construct user object with properly typed fields
    const user: User = {
      id,
      username: userData.username,
      email: userData.email,
      password: userData.password || null,
      googleId: userData.googleId || null,
      displayName: userData.displayName || null,
      pictureUrl: userData.pictureUrl || null,
      createdAt: now
    };
    
    this.users.set(id, user);
    return user;
  }
  
  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }
  
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }
  
  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(customer => customer.email === email);
  }
  
  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const id = this.customerId++;
    const now = new Date();
    const customer: Customer = {
      ...customerData,
      id,
      totalSpend: 0,
      lastSeenAt: now,
      createdAt: now
    };
    this.customers.set(id, customer);
    return customer;
  }
  
  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...data };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }
  
  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.customerId === customerId);
  }
  
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const now = new Date();
    const order: Order = {
      ...orderData,
      id,
      createdAt: now
    };
    this.orders.set(id, order);
    
    // Update customer's total spend
    const customer = this.customers.get(orderData.customerId);
    if (customer) {
      customer.totalSpend += orderData.amount;
      customer.lastSeenAt = orderData.orderDate;
      this.customers.set(customer.id, customer);
    }
    
    return order;
  }
  
  // Segment methods
  async getSegments(): Promise<Segment[]> {
    return Array.from(this.segments.values());
  }
  
  async getSegment(id: number): Promise<Segment | undefined> {
    return this.segments.get(id);
  }
  
  async getSegmentsByUserId(userId: number): Promise<Segment[]> {
    return Array.from(this.segments.values()).filter(segment => segment.createdById === userId);
  }
  
  async createSegment(segmentData: InsertSegment): Promise<Segment> {
    const id = this.segmentId++;
    const now = new Date();
    
    // Calculate audience size
    const customers = await this.getCustomersInSegment(segmentData.rules as RuleGroup);
    
    const segment: Segment = {
      ...segmentData,
      id,
      audienceSize: customers.length,
      createdAt: now
    };
    this.segments.set(id, segment);
    return segment;
  }
  
  async updateSegment(id: number, data: Partial<Segment>): Promise<Segment | undefined> {
    const segment = this.segments.get(id);
    if (!segment) return undefined;
    
    const updatedSegment = { ...segment, ...data };
    this.segments.set(id, updatedSegment);
    return updatedSegment;
  }
  
  // Helper method to evaluate rule for a customer
  private evaluateRule(customer: Customer, rule: any): boolean {
    // If it's a rule group, recursively evaluate its rules
    if (rule.logicalOperator && rule.rules) {
      const results = rule.rules.map((r: any) => this.evaluateRule(customer, r));
      
      if (rule.logicalOperator === 'AND') {
        return results.every(r => r);
      } else {
        return results.some(r => r);
      }
    }
    
    // Simple rule evaluation
    const { field, operator, value } = rule;
    
    // Get customer field value
    let customerValue: any;
    
    // Handle special fields
    if (field === 'totalSpend') {
      customerValue = customer.totalSpend;
    } else if (field === 'lastSeenAt' || field === 'lastSeen') {
      customerValue = customer.lastSeenAt;
    } else {
      customerValue = (customer as any)[field];
    }
    
    if (customerValue === undefined) return false;
    
    // Evaluate based on operator
    switch (operator) {
      case 'equals':
        return customerValue === value;
      case 'not_equals':
        return customerValue !== value;
      case 'greater_than':
        return customerValue > value;
      case 'less_than':
        return customerValue < value;
      case 'contains':
        return String(customerValue).includes(String(value));
      case 'not_contains':
        return !String(customerValue).includes(String(value));
      case 'starts_with':
        return String(customerValue).startsWith(String(value));
      case 'ends_with':
        return String(customerValue).endsWith(String(value));
      case 'is_before':
        return new Date(customerValue) < new Date(value);
      case 'is_after':
        return new Date(customerValue) > new Date(value);
      case 'is_between':
        if (Array.isArray(value) && value.length === 2) {
          return new Date(customerValue) > new Date(value[0]) && new Date(customerValue) < new Date(value[1]);
        }
        return false;
      default:
        return false;
    }
  }
  
  async getCustomersInSegment(segmentRules: RuleGroup): Promise<Customer[]> {
    const customers = await this.getCustomers();
    return customers.filter(customer => this.evaluateRule(customer, segmentRules));
  }
  
  // Campaign methods
  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }
  
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }
  
  async getCampaignsByUserId(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values())
      .filter(campaign => campaign.createdById === userId)
      .sort((a, b) => {
        const dateA = a.sentAt || a.createdAt;
        const dateB = b.sentAt || b.createdAt;
        return dateB.getTime() - dateA.getTime();
      });
  }
  
  async createCampaign(campaignData: InsertCampaign): Promise<Campaign> {
    const id = this.campaignId++;
    const now = new Date();
    
    const segment = await this.getSegment(campaignData.segmentId);
    const audienceSize = segment ? segment.audienceSize : 0;
    
    const campaign: Campaign = {
      ...campaignData,
      id,
      audienceSize,
      sentCount: 0,
      failedCount: 0,
      createdAt: now
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }
  
  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...data };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
  
  // Communication log methods
  async getCommunicationLogs(): Promise<CommunicationLog[]> {
    return Array.from(this.communicationLogs.values());
  }
  
  async getCommunicationLog(id: number): Promise<CommunicationLog | undefined> {
    return this.communicationLogs.get(id);
  }
  
  async getCommunicationLogsByCampaignId(campaignId: number): Promise<CommunicationLog[]> {
    return Array.from(this.communicationLogs.values())
      .filter(log => log.campaignId === campaignId);
  }
  
  async createCommunicationLog(logData: InsertCommunicationLog): Promise<CommunicationLog> {
    const id = this.communicationLogId++;
    const now = new Date();
    
    const log: CommunicationLog = {
      ...logData,
      id,
      sentAt: null,
      deliveredAt: null,
      createdAt: now
    };
    this.communicationLogs.set(id, log);
    return log;
  }
  
  async updateCommunicationLog(id: number, data: Partial<CommunicationLog>): Promise<CommunicationLog | undefined> {
    const log = this.communicationLogs.get(id);
    if (!log) return undefined;
    
    const updatedLog = { ...log, ...data };
    this.communicationLogs.set(id, updatedLog);
    
    // If status is updated, update campaign stats
    if (data.status) {
      const campaign = await this.getCampaign(log.campaignId);
      if (campaign) {
        if (data.status === 'delivered' && log.status !== 'delivered') {
          await this.updateCampaign(campaign.id, { sentCount: campaign.sentCount + 1 });
        } else if (data.status === 'failed' && log.status !== 'failed') {
          await this.updateCampaign(campaign.id, { failedCount: campaign.failedCount + 1 });
        }
      }
    }
    
    return updatedLog;
  }
  
  async updateCommunicationLogsInBatch(ids: number[], data: Partial<CommunicationLog>): Promise<void> {
    for (const id of ids) {
      await this.updateCommunicationLog(id, data);
    }
  }
}

export const storage = new MemStorage();
