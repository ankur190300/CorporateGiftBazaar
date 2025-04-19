import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Gift, GiftRequest, RequestStatus } from "@shared/schema";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CheckCircle,
  XCircle,
  Clock,
  Gift as GiftIcon,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  AlertCircle,
  User,
  ArrowRight,
} from "lucide-react";
import Loading from "@/components/ui/loading";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingTab, setPendingTab] = useState("gifts");

  // Fetch platform stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch pending gifts
  const { data: pendingGifts = [], isLoading: pendingGiftsLoading } = useQuery<Gift[]>({
    queryKey: ["/api/admin/pending-gifts"],
  });

  // Fetch gift requests
  const { data: giftRequests = [], isLoading: requestsLoading } = useQuery<GiftRequest[]>({
    queryKey: ["/api/gift-requests"],
  });

  // Approve/reject gift mutation
  const approveGiftMutation = useMutation({
    mutationFn: async ({ giftId, approved }: { giftId: number; approved: boolean }) => {
      const res = await apiRequest("PUT", `/api/admin/gifts/${giftId}/approve`, { approved });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-gifts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Gift updated",
        description: "The gift status has been updated successfully.",
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

  // Update gift request status mutation
  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/gift-requests/${requestId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gift-requests"] });
      toast({
        title: "Request updated",
        description: "The request status has been updated successfully.",
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

  // Handle gift approval/rejection
  const handleGiftApproval = (giftId: number, approved: boolean) => {
    approveGiftMutation.mutate({ giftId, approved });
  };

  // Handle request status update
  const handleRequestStatus = (requestId: number, status: string) => {
    updateRequestStatusMutation.mutate({ requestId, status });
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price / 100);
  };

  // Format date
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Mock data for charts (in a real app, this would come from the API)
  const giftCategoryData = [
    { name: "Drinkware", value: 15 },
    { name: "Apparel", value: 25 },
    { name: "Tech", value: 30 },
    { name: "Eco-Friendly", value: 20 },
    { name: "Office", value: 10 },
  ];

  const monthlyRequestsData = [
    { name: "Jan", requests: 4 },
    { name: "Feb", requests: 5 },
    { name: "Mar", requests: 8 },
    { name: "Apr", requests: 12 },
    { name: "May", requests: 15 },
    { name: "Jun", requests: 18 },
  ];

  const COLORS = ["#2E8B57", "#4CAF50", "#8BC34A", "#CDDC39", "#FBC02D"];

  if (statsLoading || pendingGiftsLoading || requestsLoading) {
    return <Loading />;
  }

  const pendingRequests = giftRequests.filter(
    (request) => request.status === RequestStatus.PENDING
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/users">
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  View all users
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Gifts</p>
                <p className="text-3xl font-bold">{stats?.totalGifts || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <GiftIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-muted-foreground">
                <span className="text-green-600 font-medium">{stats?.totalApprovedGifts || 0}</span> approved
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-3xl font-bold">{pendingGifts.length}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-muted-foreground">
                Requiring your review
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gift Requests</p>
                <p className="text-3xl font-bold">{stats?.totalRequests || 0}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-muted-foreground">
                <span className="text-amber-600 font-medium">{pendingRequests.length}</span> pending
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Gift Categories</CardTitle>
            <CardDescription>Distribution of gifts by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={giftCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {giftCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Gift Requests</CardTitle>
            <CardDescription>Number of gift requests over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyRequestsData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="requests" stroke="#2E8B57" fill="#2E8B57" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Items that require your review and approval</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gifts" value={pendingTab} onValueChange={setPendingTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="gifts" className="flex items-center">
                <Package className="mr-2 h-4 w-4" />
                Gifts
                <Badge className="ml-2 bg-amber-100 text-amber-800">
                  {pendingGifts.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Gift Requests
                <Badge className="ml-2 bg-amber-100 text-amber-800">
                  {pendingRequests.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gifts">
              {pendingGifts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No pending gifts
                  </h3>
                  <p className="mt-1 text-gray-500">
                    All gifts have been reviewed. Check back later for new submissions.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingGifts.map((gift) => (
                    <Card key={gift.id} className="overflow-hidden">
                      <div className="relative h-40">
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
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{gift.name}</CardTitle>
                        <CardDescription className="flex justify-between">
                          <span>{gift.category}</span>
                          <span className="font-medium text-primary">
                            {formatPrice(gift.price)}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-gray-700 text-sm line-clamp-2">
                          {gift.description}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-1/2 mr-2"
                          onClick={() => handleGiftApproval(gift.id, false)}
                          disabled={approveGiftMutation.isPending}
                        >
                          <XCircle className="mr-1 h-4 w-4 text-red-500" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="w-1/2"
                          onClick={() => handleGiftApproval(gift.id, true)}
                          disabled={approveGiftMutation.isPending}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No pending gift requests
                  </h3>
                  <p className="mt-1 text-gray-500">
                    All gift requests have been processed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id}>
                      <CardHeader className="p-4">
                        <CardTitle className="flex justify-between items-center text-lg">
                          <span>Request #{request.id}</span>
                          <Badge className="bg-amber-100 text-amber-800">
                            {request.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Submitted by User #{request.userId} on {formatDate(request.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-2">
                          <div className="font-semibold">Items:</div>
                          <ul className="space-y-1">
                            {request.items.map((item: any, index: number) => (
                              <li key={index} className="flex justify-between text-sm">
                                <span>
                                  {item.quantity}x {item.name}
                                </span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex justify-between font-semibold pt-2">
                            <span>Total:</span>
                            <span>{formatPrice(request.totalPrice)}</span>
                          </div>
                          {request.notes && (
                            <div className="pt-2">
                              <div className="font-semibold">Notes:</div>
                              <p className="text-sm text-gray-700">{request.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-1/3 mr-2"
                          onClick={() => handleRequestStatus(request.id, RequestStatus.REJECTED)}
                          disabled={updateRequestStatusMutation.isPending}
                        >
                          <XCircle className="mr-1 h-4 w-4 text-red-500" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="w-2/3"
                          onClick={() => handleRequestStatus(request.id, RequestStatus.APPROVED)}
                          disabled={updateRequestStatusMutation.isPending}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve Request
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-5 w-5" />
                Manage Users
              </Button>
            </Link>
            <Link href="/gifts">
              <Button variant="outline" className="w-full justify-start">
                <GiftIcon className="mr-2 h-5 w-5" />
                Browse All Gifts
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-5 w-5" />
                View Detailed Reports
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
