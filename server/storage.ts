import { 
  users, 
  User, 
  InsertUser, 
  gifts, 
  Gift, 
  InsertGift, 
  cartItems, 
  CartItem, 
  InsertCartItem,
  giftRequests,
  GiftRequest,
  InsertGiftRequest,
  UserRole,
  RequestStatus
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  
  // Gift operations
  getGift(id: number): Promise<Gift | undefined>;
  getAllGifts(approved?: boolean): Promise<Gift[]>;
  getGiftsByVendor(vendorId: number): Promise<Gift[]>;
  createGift(gift: InsertGift): Promise<Gift>;
  updateGift(id: number, gift: Partial<InsertGift>): Promise<Gift | undefined>;
  deleteGift(id: number): Promise<boolean>;
  approveGift(id: number, approved: boolean): Promise<Gift | undefined>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // GiftRequest operations
  createGiftRequest(request: InsertGiftRequest): Promise<GiftRequest>;
  getGiftRequests(userId?: number): Promise<GiftRequest[]>;
  updateGiftRequestStatus(id: number, status: string): Promise<GiftRequest | undefined>;
  
  // Admin operations
  getStats(): Promise<{
    totalUsers: number;
    totalGifts: number;
    totalApprovedGifts: number;
    totalRequests: number;
  }>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gifts: Map<number, Gift>;
  private cartItems: Map<number, CartItem>;
  private giftRequests: Map<number, GiftRequest>;
  public sessionStore: session.SessionStore;
  
  private userCurrentId: number;
  private giftCurrentId: number;
  private cartItemCurrentId: number;
  private giftRequestCurrentId: number;

  constructor() {
    this.users = new Map();
    this.gifts = new Map();
    this.cartItems = new Map();
    this.giftRequests = new Map();
    
    this.userCurrentId = 1;
    this.giftCurrentId = 1;
    this.cartItemCurrentId = 1;
    this.giftRequestCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Seed an admin user
    this.createUser({
      username: "admin",
      password: "admin_password", // This will be hashed by the auth service
      email: "admin@giftconnect.com",
      name: "System Admin",
      company: "GiftConnect",
      role: UserRole.ADMIN
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, role: role as UserRole };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Gift operations
  async getGift(id: number): Promise<Gift | undefined> {
    return this.gifts.get(id);
  }
  
  async getAllGifts(approved?: boolean): Promise<Gift[]> {
    const gifts = Array.from(this.gifts.values());
    
    if (approved !== undefined) {
      return gifts.filter(gift => gift.approved === approved);
    }
    
    return gifts;
  }
  
  async getGiftsByVendor(vendorId: number): Promise<Gift[]> {
    return Array.from(this.gifts.values()).filter(
      gift => gift.vendorId === vendorId
    );
  }
  
  async createGift(insertGift: InsertGift): Promise<Gift> {
    const id = this.giftCurrentId++;
    const now = new Date();
    const gift: Gift = { 
      ...insertGift, 
      id, 
      approved: false,
      createdAt: now 
    };
    this.gifts.set(id, gift);
    return gift;
  }
  
  async updateGift(id: number, giftUpdate: Partial<InsertGift>): Promise<Gift | undefined> {
    const gift = await this.getGift(id);
    if (!gift) return undefined;
    
    const updatedGift = { ...gift, ...giftUpdate };
    this.gifts.set(id, updatedGift);
    return updatedGift;
  }
  
  async deleteGift(id: number): Promise<boolean> {
    return this.gifts.delete(id);
  }
  
  async approveGift(id: number, approved: boolean): Promise<Gift | undefined> {
    const gift = await this.getGift(id);
    if (!gift) return undefined;
    
    const updatedGift = { ...gift, approved };
    this.gifts.set(id, updatedGift);
    return updatedGift;
  }
  
  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      item => item.userId === userId
    );
  }
  
  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }
  
  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if this gift is already in the cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === insertCartItem.userId && item.giftId === insertCartItem.giftId
    );
    
    if (existingItem) {
      // Update quantity instead of adding a new item
      return this.updateCartItem(existingItem.id, existingItem.quantity + insertCartItem.quantity) as Promise<CartItem>;
    }
    
    const id = this.cartItemCurrentId++;
    const cartItem: CartItem = { ...insertCartItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = await this.getCartItem(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const items = Array.from(this.cartItems.values()).filter(
      item => item.userId === userId
    );
    
    for (const item of items) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }
  
  // GiftRequest operations
  async createGiftRequest(insertGiftRequest: InsertGiftRequest): Promise<GiftRequest> {
    const id = this.giftRequestCurrentId++;
    const now = new Date();
    
    const giftRequest: GiftRequest = {
      ...insertGiftRequest,
      id,
      status: RequestStatus.PENDING,
      createdAt: now,
      updatedAt: now
    };
    
    this.giftRequests.set(id, giftRequest);
    return giftRequest;
  }
  
  async getGiftRequests(userId?: number): Promise<GiftRequest[]> {
    const requests = Array.from(this.giftRequests.values());
    
    if (userId !== undefined) {
      return requests.filter(request => request.userId === userId);
    }
    
    return requests;
  }
  
  async updateGiftRequestStatus(id: number, status: string): Promise<GiftRequest | undefined> {
    const request = this.giftRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { 
      ...request, 
      status: status as RequestStatusType,
      updatedAt: new Date()
    };
    
    this.giftRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Admin operations
  async getStats(): Promise<{
    totalUsers: number;
    totalGifts: number;
    totalApprovedGifts: number;
    totalRequests: number;
  }> {
    const approvedGifts = Array.from(this.gifts.values()).filter(
      gift => gift.approved === true
    );
    
    return {
      totalUsers: this.users.size,
      totalGifts: this.gifts.size,
      totalApprovedGifts: approvedGifts.length,
      totalRequests: this.giftRequests.size
    };
  }
}

export const storage = new MemStorage();
