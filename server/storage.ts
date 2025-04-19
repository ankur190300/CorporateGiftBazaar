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
  RequestStatus,
  GiftCategory,
  UserRoleType,
  RequestStatusType,
  GiftCategoryType
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

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
    
    // Seed vendor user
    const vendorUser = this.createUser({
      username: "vendor",
      password: "vendor_password", // This will be hashed by the auth service
      email: "vendor@luxgifts.com",
      name: "Luxury Gifts Vendor",
      company: "Luxury Gifts Co.",
      role: UserRole.VENDOR
    });
    
    // Seed HR user
    this.createUser({
      username: "hr",
      password: "hr_password", // This will be hashed by the auth service
      email: "hr@acmecorp.com",
      name: "HR Manager",
      company: "Acme Corporation",
      role: UserRole.HR
    });
    
    // Seed sample gifts
    this.createGift({
      name: "Premium Leather Journal",
      description: "Handcrafted leather journal with custom embossing options. Perfect for executives and team leaders.",
      price: 3500, // $35.00
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1887&ixlib=rb-4.0.3",
      category: GiftCategory.OFFICE,
      vendorId: vendorUser.id,
      brandable: true,
      ecoFriendly: false,
      approved: true
    });
    
    this.createGift({
      name: "Sustainable Bamboo Gift Set",
      description: "Eco-friendly bamboo gift set including a water bottle, cutlery set, and lunch box. All items can be customized with your company logo.",
      price: 4500, // $45.00
      imageUrl: "https://images.unsplash.com/photo-1584897149326-a77811068203?auto=format&fit=crop&q=80&w=1964&ixlib=rb-4.0.3",
      category: GiftCategory.ECO_FRIENDLY,
      vendorId: vendorUser.id,
      brandable: true,
      ecoFriendly: true,
      approved: true
    });
    
    this.createGift({
      name: "Wireless Charging Desk Organizer",
      description: "Multi-functional desk organizer with built-in wireless charging pad. Keeps desks tidy while providing convenient charging for phones.",
      price: 5900, // $59.00
      imageUrl: "https://images.unsplash.com/photo-1619506147448-b56ba8ee11ec?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
      category: GiftCategory.TECHNOLOGY,
      vendorId: vendorUser.id,
      brandable: true,
      ecoFriendly: false,
      approved: true
    });
    
    this.createGift({
      name: "Gourmet Coffee Gift Basket",
      description: "Luxury gift basket featuring premium coffee beans from around the world, accompanied by artisanal cookies and a branded ceramic mug.",
      price: 7500, // $75.00
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1887&ixlib=rb-4.0.3",
      category: GiftCategory.FOOD_BEVERAGE,
      vendorId: vendorUser.id,
      brandable: true,
      ecoFriendly: false,
      approved: true
    });
    
    this.createGift({
      name: "Mindfulness Meditation Kit",
      description: "Complete wellness kit with guided meditation cards, essential oils, and a premium eye pillow. Helps reduce stress and promote well-being.",
      price: 6200, // $62.00
      imageUrl: "https://images.unsplash.com/photo-1602192509154-0b900ee1f851?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
      category: GiftCategory.WELLNESS,
      vendorId: vendorUser.id,
      brandable: false,
      ecoFriendly: true,
      approved: true
    });
    
    this.createGift({
      name: "Executive Desk Plant Set",
      description: "Set of three low-maintenance desk plants in elegant ceramic pots. Brings nature into the office environment.",
      price: 4200, // $42.00
      imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=1972&ixlib=rb-4.0.3",
      category: GiftCategory.ECO_FRIENDLY,
      vendorId: vendorUser.id,
      brandable: true,
      ecoFriendly: true,
      approved: true
    });
    
    this.createGift({
      name: "Personalized Photo Calendar",
      description: "Custom wall calendar featuring your team photos or company achievements. A great way to celebrate company milestones.",
      price: 2900, // $29.00
      imageUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=2068&ixlib=rb-4.0.3",
      category: GiftCategory.CUSTOMIZED,
      vendorId: vendorUser.id,
      brandable: true,
      ecoFriendly: false,
      approved: true
    });
    
    this.createGift({
      name: "Premium Wine Gift Set",
      description: "Elegant gift box containing two bottles of premium wine, paired with gourmet chocolates and cheese. Perfect for client appreciation.",
      price: 8900, // $89.00
      imageUrl: "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
      category: GiftCategory.FOOD_BEVERAGE,
      vendorId: vendorUser.id,
      brandable: false,
      ecoFriendly: false,
      approved: true
    });
    
    this.createGift({
      name: "Smart Water Bottle",
      description: "Technology-enhanced water bottle that tracks hydration levels and glows to remind users to drink water. Can be branded with company logo.",
      price: 4800, // $48.00
      imageUrl: "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&q=80&w=1887&ixlib=rb-4.0.3",
      category: GiftCategory.TECHNOLOGY,
      vendorId: vendorUser.id,
      brandable: true,
      ecoFriendly: true,
      approved: true
    });
    
    this.createGift({
      name: "Virtual Reality Headset",
      description: "Entry-level VR headset for immersive team building activities or virtual office tours. Comes with pre-loaded apps.",
      price: 12900, // $129.00
      imageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
      category: GiftCategory.TECHNOLOGY,
      vendorId: vendorUser.id,
      brandable: false,
      ecoFriendly: false,
      approved: true
    });
    
    this.createGift({
      name: "Custom Company Hoodie",
      description: "High-quality, comfortable hoodie with embroidered company logo. Available in multiple colors and sizes.",
      price: 3800, // $38.00
      imageUrl: "https://images.unsplash.com/photo-1572495641004-28421ae29e9b?auto=format&fit=crop&q=80&w=2057&ixlib=rb-4.0.3",
      category: GiftCategory.APPAREL,
      vendorId: vendorUser.id,
      brandable: true,
      ecoFriendly: false,
      approved: true
    });
    
    this.createGift({
      name: "Portable Espresso Maker",
      description: "Compact, travel-friendly espresso maker for coffee lovers on the go. Perfect for business travelers.",
      price: 6500, // $65.00
      imageUrl: "https://images.unsplash.com/photo-1632079001242-307e71b468e4?auto=format&fit=crop&q=80&w=1287&ixlib=rb-4.0.3",
      category: GiftCategory.TRAVEL,
      vendorId: vendorUser.id,
      brandable: false,
      ecoFriendly: false,
      approved: true
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
