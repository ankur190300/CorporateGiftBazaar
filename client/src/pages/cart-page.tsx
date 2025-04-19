import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  CreditCard,
  AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Loading from "@/components/ui/loading";

type CartItemWithGift = {
  id: number;
  userId: number;
  giftId: number;
  quantity: number;
  gift: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
  };
};

export default function CartPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [notes, setNotes] = useState("");

  // Fetch cart items
  const { 
    data: cartItems = [], 
    isLoading,
    error
  } = useQuery<CartItemWithGift[]>({
    queryKey: ["/api/cart"],
  });

  // Update cart item quantity
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove item from cart
  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit gift request
  const submitGiftRequestMutation = useMutation({
    mutationFn: async (data: { notes: string }) => {
      const res = await apiRequest("POST", "/api/gift-requests", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request submitted",
        description: "Your gift request has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update quantity
  const handleUpdateQuantity = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    updateCartItemMutation.mutate({ id, quantity: newQuantity });
  };

  // Remove item
  const handleRemoveItem = (id: number) => {
    removeFromCartMutation.mutate(id);
  };

  // Submit gift request
  const handleSubmitRequest = () => {
    submitGiftRequestMutation.mutate({ notes });
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.gift.price * item.quantity);
    }, 0);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price / 100);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-2xl font-semibold text-gray-900">Error loading cart</h3>
          <p className="mt-1 text-gray-500">
            There was a problem loading your cart. Please try again later.
          </p>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cart"] })}
            className="mt-6"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-2xl font-semibold text-gray-900">Your cart is empty</h3>
          <p className="mt-1 text-gray-500">
            Looks like you haven't added any gifts to your cart yet.
          </p>
          <Button
            onClick={() => navigate("/gifts")}
            className="mt-6"
          >
            Browse Gifts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
              <CardDescription>
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Gift</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <img
                          src={item.gift.imageUrl}
                          alt={item.gift.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.gift.name}</div>
                          <div className="text-sm text-gray-500">{item.gift.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(item.gift.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1 || updateCartItemMutation.isPending}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            disabled={updateCartItemMutation.isPending}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{formatPrice(item.gift.price * item.quantity)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeFromCartMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>

              <div className="pt-4">
                <Textarea
                  placeholder="Add notes for your request (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" size="lg" disabled={submitGiftRequestMutation.isPending}>
                    <CreditCard className="mr-2 h-5 w-5" />
                    {submitGiftRequestMutation.isPending ? "Processing..." : "Submit Gift Request"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Gift Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to submit this gift request? Once submitted, 
                      it will be reviewed by admin for approval.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmitRequest}>
                      Confirm Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
