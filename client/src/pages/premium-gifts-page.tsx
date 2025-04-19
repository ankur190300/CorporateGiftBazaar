import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Gift, GiftCategory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  MessageSquare, 
  User, 
  Send, 
  Bot, 
  ShoppingCart,
  Loader2
} from "lucide-react";

// Types for chat messages
type MessageRole = "user" | "assistant" | "system";

type Message = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
};

type CustomHamper = {
  name: string;
  description: string;
  items: string[];
  price: number;
  imageUrl?: string;
};

export default function CustomHamperChatbot() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your gift hamper assistant. Tell me about the type of gift hamper you'd like to create, including your budget, occasion, and any preferences for items to include.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [currentHamper, setCurrentHamper] = useState<CustomHamper | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all gifts for reference
  const { data: gifts = [] } = useQuery<Gift[]>({
    queryKey: ["/api/gifts", { approved: true }],
  });

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulated chatbot message generation
  const [isBotTyping, setIsBotTyping] = useState(false);
  
  const generateBotResponse = async (userMessage: string) => {
    setIsBotTyping(true);
    
    // In a real implementation, this would call the OpenAI API
    // For now, we'll simulate a response based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    // Wait for simulated processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let botResponse = "";
    let suggestedHamper: CustomHamper | null = null;
    
    // Simple keyword-based response logic
    if (lowerMessage.includes("budget") || lowerMessage.includes("price")) {
      botResponse = "We have hampers at various price points. Our economy hampers start at $50, standard hampers around $100, and premium options can go up to $300. What price range are you thinking of?";
    } 
    else if (lowerMessage.includes("christmas") || lowerMessage.includes("holiday")) {
      botResponse = "For holiday gift hampers, I recommend including festive treats like chocolates, cookies, and perhaps a bottle of wine or spirits if appropriate. Would you like me to suggest a complete holiday hamper?";
      suggestedHamper = {
        name: "Holiday Celebration Hamper",
        description: "A festive collection of gourmet treats and holiday-themed items perfect for the season.",
        items: ["Gourmet Chocolate Box", "Assorted Cookies", "Sparkling Cider", "Holiday Ornament", "Scented Candle"],
        price: 12500 // $125.00
      };
    }
    else if (lowerMessage.includes("thank you") || lowerMessage.includes("appreciation")) {
      botResponse = "For appreciation hampers, I suggest a mix of practical items and indulgent treats. Would you like a suggestion for a thank you hamper?";
      suggestedHamper = {
        name: "Gratitude Gift Basket",
        description: "A thoughtful collection of items to show sincere appreciation.",
        items: ["Premium Leather Journal", "Gourmet Tea Set", "Artisan Chocolates", "Wireless Charger", "Succulent Plant"],
        price: 15000 // $150.00
      };
    }
    else if (lowerMessage.includes("wellness") || lowerMessage.includes("health") || lowerMessage.includes("self care")) {
      botResponse = "A wellness hamper is an excellent choice! I can suggest a collection of items focused on relaxation and self-care. Would you like to see my recommendation?";
      suggestedHamper = {
        name: "Wellness & Relaxation Hamper",
        description: "A curated selection of items to promote relaxation and well-being.",
        items: ["Essential Oil Diffuser", "Organic Tea Sampler", "Luxury Bath Bombs", "Mindfulness Journal", "Bamboo Towel Set"],
        price: 13500 // $135.00
      };
    }
    else if (lowerMessage.includes("tech") || lowerMessage.includes("gadget")) {
      botResponse = "For tech enthusiasts, I can put together a hamper with useful gadgets and accessories. Would you like to see what I have in mind?";
      suggestedHamper = {
        name: "Tech Essentials Hamper",
        description: "A collection of must-have tech accessories for the modern professional.",
        items: ["Wireless Earbuds", "Power Bank", "Multi-device Charging Station", "Smart Notebook", "Tech Organizer Pouch"],
        price: 18000 // $180.00
      };
    }
    else if (lowerMessage.includes("create") || lowerMessage.includes("customize") || lowerMessage.includes("make")) {
      botResponse = "I'd be happy to help you create a custom hamper. Could you tell me more about the occasion, recipient preferences, and your budget?";
    }
    else {
      botResponse = "I'd be happy to help you create the perfect gift hamper. Could you tell me more about your requirements? For example, what's the occasion, who is it for, and do you have a specific budget in mind?";
    }
    
    // Add bot response to messages
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: botResponse,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsBotTyping(false);
    
    if (suggestedHamper) {
      setCurrentHamper(suggestedHamper);
    }
  };

  // Handle sending a message
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Generate bot response
    await generateBotResponse(userMessage.content);
  };

  // Mutation for adding hamper to cart
  const addToCartMutation = useMutation({
    mutationFn: async (hamper: CustomHamper) => {
      const res = await apiRequest("POST", "/api/cart", {
        giftId: 0, // Custom hamper
        userId: user?.id,
        quantity: 1,
        customHamper: hamper
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Added to Cart",
        description: "Your custom hamper has been added to your cart.",
      });
      // Reset current hamper
      setCurrentHamper(null);
      
      // Add confirmation message from bot
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Great! I've added your custom hamper to your cart. Is there anything else you'd like help with?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmationMessage]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to add hamper to cart: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Add hamper to cart
  const addHamperToCart = () => {
    if (currentHamper) {
      addToCartMutation.mutate(currentHamper);
    }
  };

  // Handle input submission on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Custom Gift Hamper Creator</h1>
        <p className="text-gray-600 mt-1">
          Chat with our AI assistant to create personalized gift hampers for any occasion
        </p>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="md:col-span-2 flex flex-col h-[600px] border rounded-lg overflow-hidden bg-gray-50">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex mb-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                {message.role === "user" && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center ml-2">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isBotTyping && (
              <div className="flex mb-4 justify-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="rounded-lg px-4 py-2 bg-gray-200 text-gray-800">
                  <p className="text-sm flex items-center">
                    <span className="mr-2">Typing</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the hamper you'd like to create..."
                className="flex-1 mr-2"
              />
              <Button 
                onClick={sendMessage} 
                size="icon" 
                disabled={!input.trim() || isBotTyping}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Current Hamper Preview */}
        <div className="md:col-span-1">
          <Card className="p-4 h-full">
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-primary" />
              Hamper Preview
            </h2>
            
            {currentHamper ? (
              <>
                <h3 className="text-primary font-medium">{currentHamper.name}</h3>
                <p className="text-sm text-gray-600 mt-1 mb-2">{currentHamper.description}</p>
                
                <h4 className="text-sm font-medium mt-4 mb-2">Items:</h4>
                <ul className="text-sm space-y-1 mb-4">
                  {currentHamper.items.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
                
                <p className="text-sm font-medium">
                  Price: ${(currentHamper.price / 100).toFixed(2)}
                </p>
                
                <Button
                  onClick={addHamperToCart}
                  className="w-full mt-4"
                  disabled={addToCartMutation.isPending}
                >
                  {addToCartMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
                  Add to Cart
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mb-4 text-gray-300" />
                <p>Chat with the assistant to create a custom gift hamper.</p>
                <p className="text-sm mt-2">Your custom hamper preview will appear here.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}