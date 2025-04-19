import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles
export const UserRole = {
  HR: "HR",
  VENDOR: "VENDOR",
  ADMIN: "ADMIN",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  company: text("company"),
  role: text("role").$type<UserRoleType>().notNull().default(UserRole.HR),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  company: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Gift categories
export const GiftCategory = {
  DRINKWARE: "Drinkware",
  APPAREL: "Apparel",
  TECH: "Tech Accessories",
  ECO: "Eco-Friendly",
  OFFICE: "Office Supplies",
  WELLNESS: "Wellness",
  FOOD: "Food & Beverage",
  TRAVEL: "Travel",
} as const;

export type GiftCategoryType = typeof GiftCategory[keyof typeof GiftCategory];

// Gift items
export const gifts = pgTable("gifts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // In cents
  vendorId: integer("vendor_id").notNull(), // References vendor user id
  category: text("category").$type<GiftCategoryType>().notNull(),
  imageUrl: text("image_url").notNull(),
  brandable: boolean("brandable").notNull().default(false),
  ecoFriendly: boolean("eco_friendly").notNull().default(false),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGiftSchema = createInsertSchema(gifts).pick({
  name: true,
  description: true,
  price: true,
  vendorId: true,
  category: true,
  imageUrl: true,
  brandable: true,
  ecoFriendly: true,
});

export type InsertGift = z.infer<typeof insertGiftSchema>;
export type Gift = typeof gifts.$inferSelect;

// Cart items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // HR user ID
  giftId: integer("gift_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  giftId: true,
  quantity: true,
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// Gift Requests
export const RequestStatus = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
} as const;

export type RequestStatusType = typeof RequestStatus[keyof typeof RequestStatus];

export const giftRequests = pgTable("gift_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // HR user ID
  items: jsonb("items").notNull(), // Array of {giftId, quantity, price}
  totalPrice: integer("total_price").notNull(), // In cents
  status: text("status").$type<RequestStatusType>().notNull().default(RequestStatus.PENDING),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertGiftRequestSchema = createInsertSchema(giftRequests).pick({
  userId: true,
  items: true,
  totalPrice: true,
  notes: true,
});

export type InsertGiftRequest = z.infer<typeof insertGiftRequestSchema>;
export type GiftRequest = typeof giftRequests.$inferSelect;
