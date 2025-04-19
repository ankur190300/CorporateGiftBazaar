import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Gift, GiftCategory } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Package,
  Plus,
  PenLine,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
} from "lucide-react";
import Loading from "@/components/ui/loading";
import { Link } from "wouter";
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

export default function VendorProducts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch vendor's gifts
  const { data: gifts = [], isLoading } = useQuery<Gift[]>({
    queryKey: ["/api/vendor/gifts"],
  });

  // Filter gifts based on active tab
  const filteredGifts = gifts.filter((gift) => {
    if (activeTab === "all") return true;
    if (activeTab === "approved") return gift.approved;
    if (activeTab === "pending") return !gift.approved;
    return true;
  });

  // New gift form schema
  const newGiftSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(1, "Price must be at least $0.01"),
    category: z.string().min(1, "Category is required"),
    imageUrl: z.string().url("Must be a valid URL"),
    brandable: z.boolean().default(false),
    ecoFriendly: z.boolean().default(false),
  });

  // Form hook
  const form = useForm<z.infer<typeof newGiftSchema>>({
    resolver: zodResolver(newGiftSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      imageUrl: "",
      brandable: false,
      ecoFriendly: false,
    },
  });

  // Add new gift mutation
  const addGiftMutation = useMutation({
    mutationFn: async (data: z.infer<typeof newGiftSchema>) => {
      // Convert dollars to cents for API
      const giftData = {
        ...data,
        price: Math.round(data.price * 100),
      };
      const res = await apiRequest("POST", "/api/vendor/gifts", giftData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/gifts"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Gift added",
        description: "Your gift has been added and is pending approval.",
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

  // Delete gift mutation
  const deleteGiftMutation = useMutation({
    mutationFn: async (giftId: number) => {
      await apiRequest("DELETE", `/api/vendor/gifts/${giftId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/gifts"] });
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

  // Form submit handler
  const onSubmit = (data: z.infer<typeof newGiftSchema>) => {
    addGiftMutation.mutate(data);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Products</h1>
          <p className="text-gray-600 mt-1">
            Manage your gift products and track their status
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Gift
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Gift</DialogTitle>
              <DialogDescription>
                Add a new gift product to your catalog. It will be reviewed by an administrator before going live.
              </DialogDescription>
            </DialogHeader>

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
                          <Input placeholder="Premium Leather Journal" {...field} />
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
                            placeholder="29.99"
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Textarea
                          placeholder="Describe your gift product in detail..."
                          rows={4}
                          {...field}
                        />
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
                        <Input
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
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

                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={addGiftMutation.isPending}
                  >
                    {addGiftMutation.isPending ? "Adding..." : "Add Gift"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all" className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            All Products
            <Badge className="ml-2 bg-gray-100 text-gray-800">{gifts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            Approved
            <Badge className="ml-2 bg-green-100 text-green-800">
              {gifts.filter(g => g.approved).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Pending Approval
            <Badge className="ml-2 bg-amber-100 text-amber-800">
              {gifts.filter(g => !g.approved).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredGifts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-gray-500">
                {activeTab === "all"
                  ? "You haven't added any gift products yet."
                  : activeTab === "approved"
                  ? "None of your products have been approved yet."
                  : "You don't have any pending products."}
              </p>
              {activeTab === "all" && (
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="mt-4"
                >
                  Add Your First Gift
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGifts.map((gift) => (
                <Card key={gift.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={gift.imageUrl}
                      alt={gift.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
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
                      <Badge
                        variant="outline"
                        className="absolute top-2 left-2 bg-white/80 text-amber-500 border-amber-500"
                      >
                        Pending Approval
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span className="text-xl">{gift.name}</span>
                      <span className="text-primary font-bold">
                        {formatPrice(gift.price)}
                      </span>
                    </CardTitle>
                    <CardDescription>{gift.category}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-700 line-clamp-2">{gift.description}</p>
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      <Link href={`/gifts/${gift.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/gifts/${gift.id}`}>
                        <Button variant="outline" size="sm">
                          <PenLine className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the gift from your catalog.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteGiftMutation.mutate(gift.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {deleteGiftMutation.isPending ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
