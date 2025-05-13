import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"), // Will be null for Google OAuth users
  googleId: text("google_id").unique(),
  displayName: text("display_name"),
  pictureUrl: text("picture_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  status: text("status").default("active").notNull(),
  totalSpend: doublePrecision("total_spend").default(0).notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  totalSpend: true,
  lastSeenAt: true,
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  amount: doublePrecision("amount").notNull(),
  status: text("status").default("completed").notNull(),
  items: jsonb("items"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

// Segments table
export const segments = pgTable("segments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rules: jsonb("rules").notNull(),
  createdById: integer("created_by_id").notNull(),
  audienceSize: integer("audience_size").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSegmentSchema = createInsertSchema(segments).omit({
  id: true,
  createdAt: true,
  audienceSize: true,
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  segmentId: integer("segment_id").notNull(),
  message: text("message").notNull(),
  createdById: integer("created_by_id").notNull(),
  sentAt: timestamp("sent_at"),
  status: text("status").default("draft").notNull(),
  audienceSize: integer("audience_size").default(0),
  sentCount: integer("sent_count").default(0),
  failedCount: integer("failed_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  audienceSize: true,
  sentCount: true,
  failedCount: true,
});

// Communication logs table
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  customerId: integer("customer_id").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending").notNull(),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommunicationLogSchema = createInsertSchema(communicationLogs).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  deliveredAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Segment = typeof segments.$inferSelect;
export type InsertSegment = z.infer<typeof insertSegmentSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;

// Rule types for segment builder
export type RuleOperator = "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_contains" | "starts_with" | "ends_with" | "is_before" | "is_after" | "is_between";
export type LogicalOperator = "AND" | "OR";

export type Rule = {
  field: string;
  operator: RuleOperator;
  value: string | number | boolean | Date;
};

export type RuleGroup = {
  logicalOperator: LogicalOperator;
  rules: (Rule | RuleGroup)[];
};
