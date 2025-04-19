import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { UserRole } from "@shared/schema";
import { insertGiftSchema, insertCartItemSchema, insertGiftRequestSchema } from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check user role
const hasRole = (role: string) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.role !== role && req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: "Forbidden" });
  }
  
  next();
};

// Middleware for admin only access
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Gift routes
  app.get("/api/gifts", async (req, res, next) => {
    try {
      const approved = req.query.approved === "true" ? true : 
                        req.query.approved === "false" ? false : undefined;
      const category = req.query.category as string | undefined;
      const brandable = req.query.brandable === "true" ? true : undefined;
      const ecoFriendly = req.query.ecoFriendly === "true" ? true : undefined;
      const search = req.query.search as string | undefined;
      
      let gifts = await storage.getAllGifts(approved);
      
      // Apply filters
      if (category) {
        gifts = gifts.filter(gift => gift.category === category);
      }
      
      if (brandable !== undefined) {
        gifts = gifts.filter(gift => gift.brandable === brandable);
      }
      
      if (ecoFriendly !== undefined) {
        gifts = gifts.filter(gift => gift.ecoFriendly === ecoFriendly);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        gifts = gifts.filter(gift => 
          gift.name.toLowerCase().includes(searchLower) || 
          gift.description.toLowerCase().includes(searchLower)
        );
      }
      
      res.json(gifts);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/gifts/:id", async (req, res, next) => {
    try {
      const gift = await storage.getGift(parseInt(req.params.id));
      
      if (!gift) {
        return res.status(404).json({ message: "Gift not found" });
      }
      
      res.json(gift);
    } catch (error) {
      next(error);
    }
  });
  
  // Vendor gift management routes
  app.get("/api/vendor/gifts", isAuthenticated, hasRole(UserRole.VENDOR), async (req, res, next) => {
    try {
      const gifts = await storage.getGiftsByVendor(req.user.id);
      res.json(gifts);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/vendor/gifts", isAuthenticated, hasRole(UserRole.VENDOR), async (req, res, next) => {
    try {
      const validatedData = insertGiftSchema.parse({
        ...req.body,
        vendorId: req.user.id
      });
      
      const gift = await storage.createGift(validatedData);
      res.status(201).json(gift);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });
  
  app.put("/api/vendor/gifts/:id", isAuthenticated, hasRole(UserRole.VENDOR), async (req, res, next) => {
    try {
      const giftId = parseInt(req.params.id);
      const gift = await storage.getGift(giftId);
      
      if (!gift) {
        return res.status(404).json({ message: "Gift not found" });
      }
      
      if (gift.vendorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "You don't have permission to edit this gift" });
      }
      
      // Approved gifts cannot be edited without admin approval
      if (gift.approved && req.user.role !== UserRole.ADMIN) {
        // Set to unapproved when edited by vendor
        req.body.approved = false;
      }
      
      const updatedGift = await storage.updateGift(giftId, req.body);
      res.json(updatedGift);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/vendor/gifts/:id", isAuthenticated, hasRole(UserRole.VENDOR), async (req, res, next) => {
    try {
      const giftId = parseInt(req.params.id);
      const gift = await storage.getGift(giftId);
      
      if (!gift) {
        return res.status(404).json({ message: "Gift not found" });
      }
      
      if (gift.vendorId !== req.user.id && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "You don't have permission to delete this gift" });
      }
      
      await storage.deleteGift(giftId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Cart routes
  app.get("/api/cart", isAuthenticated, hasRole(UserRole.HR), async (req, res, next) => {
    try {
      const cartItems = await storage.getCartItems(req.user.id);
      
      // Get gift details for each cart item
      const cartWithDetails = await Promise.all(
        cartItems.map(async (item) => {
          const gift = await storage.getGift(item.giftId);
          return { ...item, gift };
        })
      );
      
      res.json(cartWithDetails);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/cart", isAuthenticated, hasRole(UserRole.HR), async (req, res, next) => {
    try {
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if gift exists and is approved
      const gift = await storage.getGift(validatedData.giftId);
      if (!gift) {
        return res.status(404).json({ message: "Gift not found" });
      }
      
      if (!gift.approved) {
        return res.status(400).json({ message: "This gift is not available for purchase" });
      }
      
      const cartItem = await storage.addToCart(validatedData);
      
      // Get gift details
      const gift2 = await storage.getGift(cartItem.giftId);
      res.status(201).json({ ...cartItem, gift: gift2 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });
  
  app.put("/api/cart/:id", isAuthenticated, hasRole(UserRole.HR), async (req, res, next) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const cartItem = await storage.getCartItem(cartItemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      if (cartItem.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to modify this cart item" });
      }
      
      const { quantity } = req.body;
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const updatedItem = await storage.updateCartItem(cartItemId, quantity);
      
      // Get gift details
      const gift = await storage.getGift(updatedItem!.giftId);
      res.json({ ...updatedItem, gift });
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/cart/:id", isAuthenticated, hasRole(UserRole.HR), async (req, res, next) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const cartItem = await storage.getCartItem(cartItemId);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      if (cartItem.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to remove this cart item" });
      }
      
      await storage.removeFromCart(cartItemId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
  
  // Gift request routes
  app.post("/api/gift-requests", isAuthenticated, hasRole(UserRole.HR), async (req, res, next) => {
    try {
      // Get cart items
      const cartItems = await storage.getCartItems(req.user.id);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Your cart is empty" });
      }
      
      // Calculate total price and create items array
      let totalPrice = 0;
      const items = await Promise.all(
        cartItems.map(async (item) => {
          const gift = await storage.getGift(item.giftId);
          if (!gift) {
            throw new Error(`Gift with ID ${item.giftId} not found`);
          }
          
          const itemTotal = gift.price * item.quantity;
          totalPrice += itemTotal;
          
          return {
            giftId: item.giftId,
            quantity: item.quantity,
            price: gift.price,
            name: gift.name
          };
        })
      );
      
      const validatedData = insertGiftRequestSchema.parse({
        userId: req.user.id,
        items,
        totalPrice,
        notes: req.body.notes || ""
      });
      
      const giftRequest = await storage.createGiftRequest(validatedData);
      
      // Clear the user's cart
      await storage.clearCart(req.user.id);
      
      res.status(201).json(giftRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  });
  
  app.get("/api/gift-requests", isAuthenticated, async (req, res, next) => {
    try {
      // HR users can only see their own requests
      if (req.user.role === UserRole.HR) {
        const requests = await storage.getGiftRequests(req.user.id);
        return res.json(requests);
      }
      
      // Admin can see all requests
      if (req.user.role === UserRole.ADMIN) {
        const requests = await storage.getGiftRequests();
        return res.json(requests);
      }
      
      // Vendors aren't allowed to see requests
      return res.status(403).json({ message: "Forbidden" });
    } catch (error) {
      next(error);
    }
  });
  
  // Admin routes
  app.get("/api/admin/pending-gifts", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const pendingGifts = await storage.getAllGifts(false);
      res.json(pendingGifts);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/admin/gifts/:id/approve", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const giftId = parseInt(req.params.id);
      const { approved } = req.body;
      
      if (typeof approved !== "boolean") {
        return res.status(400).json({ message: "Invalid approved status" });
      }
      
      const updatedGift = await storage.approveGift(giftId, approved);
      
      if (!updatedGift) {
        return res.status(404).json({ message: "Gift not found" });
      }
      
      res.json(updatedGift);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords before sending
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/admin/users/:id/role", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/admin/gift-requests/:id/status", isAuthenticated, isAdmin, async (req, res, next) => {
    try {
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedRequest = await storage.updateGiftRequestStatus(requestId, status);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Gift request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
