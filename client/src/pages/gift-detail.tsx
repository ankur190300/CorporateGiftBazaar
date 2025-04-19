import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Gift, GiftCategory, UserRole } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Loading from "@/components/ui/loading";
import {
  Check,
  X,
  ShoppingCart,
  Edit,
  Trash2,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
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

export default function GiftDetail() {
  const { id } = useParams<{ id: string }>();
  const giftId = parseInt(id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch gift details
  const { data: gift, isLoading, error } = useQuery<Gift>({
    queryKey: [`/api/gifts/${giftId}`],
  });

  // Fetch vendor details (for display)
  const { data: vendor } = useQuery({
    queryKey: [`/api/users/${gift?.vendorId}`],
    enabled: !!gift,
  });

  // Form schema for gift editing (vendor only)
  const editGiftSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(1, "Price must be at least $0.01"),
    category: z.string().min(1, "Category is required"),
    imageUrl: z.string().url("Must be a valid URL"),
    brandable: z.boolean(),
    ecoFriendly: z.boolean(),
  });

  // Form hook for editing
  const form = useForm<z.infer<typeof editGiftSchema>>({
    resolver: zodResolver(editGiftSchema),
    defaultValues: {
      name: gift?.name || "",
      description: gift?.description || "",
      price: gift ? gift.price / 100 : 0, // Convert cents to dollars for display
      category: gift?.category || "",
      imageUrl: gift?.imageUrl || "",
      brandable: gift?.brandable || false,
      ecoFriendly: gift?.ecoFriendly || false,
    },
  });

  // Update form values when gift data loads
  useEffect(() => {
    if (gift) {
      form.reset({
        name: gift.name,
        description: gift.description,
        price: gift.price / 100, // Convert cents to dollars for display
        category: gift.category,
        imageUrl: gift.imageUrl,
        brandable: gift.brandable,
        ecoFriendly: gift.ecoFriendly,
      });
    }
  }, [gift, form]);

  // HR: Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (data: { giftId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/cart", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "The gift has been added to your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Vendor: Update gift mutation
  const updateGiftMutation = useMutation({
    mutationFn: async (data: z.infer<typeof editGiftSchema>) => {
      // Convert dollars to cents for API
      const updatedData = {
        ...data,
        price: Math.round(data.price * 100),
      };
      const res = await apiRequest("PUT", `/api/vendor/gifts/${giftId}`, updatedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/gifts/${giftId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/gifts"] });
      setIsEditing(false);
      toast({
        title: "Gift updated",
        description: "Your gift has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Vendor: Delete gift mutation
  const deleteGiftMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/vendor/gifts/${giftId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/gifts"] });
      navigate("/vendor/products");
      toast({
        title: "Gift deleted",
        description: "Your gift has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Admin: Approve/reject gift mutation
  const approveGiftMutation = useMutation({
    mutationFn: async (approved: boolean) => {
      const res = await apiRequest("PUT", `/api/admin/gifts/${giftId}/approve`, { approved });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/gifts/${giftId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-gifts"] });
      toast({
        title: "Gift status updated",
        description: "The gift approval status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle add to cart
  const handleAddToCart = () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    addToCartMutation.mutate({ giftId, quantity: 1 });
  };

  // Handle gift update (for vendors)
  const onSubmit = (data: z.infer<typeof editGiftSchema>) => {
    updateGiftMutation.mutate(data);
  };

  // Format price for display
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

  if (error || !gift) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <h3 className="mt-2 text-2xl font-semibold text-gray-900">Gift not found</h3>
          <p className="mt-1 text-gray-500">
            The gift you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => navigate("/gifts")}
            className="mt-6"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to gifts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
        onClick={() => navigate("/gifts")}
        variant="ghost"
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all gifts
      </Button>

      {isEditing && user?.role === UserRole.VENDOR ? (
        // Vendor Edit Form
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-primary mb-6">Edit Gift</h1>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gift Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(GiftCategory).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="brandable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Brandable</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            This gift can be customized with company logos
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ecoFriendly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Eco-Friendly</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            This gift is made from sustainable materials
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateGiftMutation.isPending}
                  >
                    {updateGiftMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        // Gift Detail View
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative">
            <img
              src={gift.imageUrl}
              alt={gift.name}
              className="w-full h-auto rounded-lg shadow-md object-cover"
            />
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {gift.brandable && (
                <Badge className="bg-amber-200 text-primary hover:bg-amber-300">
                  Brandable
                </Badge>
              )}
              {gift.ecoFriendly && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                  Eco-friendly
                </Badge>
              )}
            </div>

            {!gift.approved && (
              <div className="absolute top-0 left-0 w-full h-full bg-black/10 flex items-center justify-center rounded-lg">
                <Badge
                  variant="outline"
                  className="bg-white text-amber-500 border-amber-500 text-lg py-2 px-4"
                >
                  Pending Approval
                </Badge>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{gift.name}</h1>
                <p className="text-lg text-gray-500 mt-1">{gift.category}</p>
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(gift.price)}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{gift.description}</p>
            </div>

            <Separator className="my-6" />

            <div>
              <h3 className="text-xl font-semibold mb-2">Vendor</h3>
              <p className="text-gray-700">
                {vendor?.name || "Vendor information unavailable"}
              </p>
            </div>

            <div className="mt-8 flex flex-col space-y-4">
              {/* HR: Add to cart button */}
              {user?.role === UserRole.HR && gift.approved && (
                <Button
                  onClick={handleAddToCart}
                  className="w-full md:w-auto"
                  size="lg"
                  disabled={addToCartMutation.isPending}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
              )}

              {/* Vendor: Edit/Delete buttons */}
              {user?.role === UserRole.VENDOR && user.id === gift.vendorId && (
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit Gift
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex-1">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Gift
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          gift from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteGiftMutation.mutate()}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          {deleteGiftMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

              {/* Admin: Approve/Reject buttons */}
              {user?.role === UserRole.ADMIN && (
                <div className="flex flex-wrap gap-4">
                  {gift.approved ? (
                    <Button
                      onClick={() => approveGiftMutation.mutate(false)}
                      variant="outline"
                      className="flex-1"
                      disabled={approveGiftMutation.isPending}
                    >
                      <X className="mr-2 h-4 w-4" />
                      {approveGiftMutation.isPending ? "Processing..." : "Mark as Unapproved"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => approveGiftMutation.mutate(true)}
                      className="flex-1"
                      disabled={approveGiftMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {approveGiftMutation.isPending ? "Processing..." : "Approve Gift"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
