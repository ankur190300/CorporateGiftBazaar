import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserRole } from "@shared/schema";
import {
  User,
  UserCog,
  Search,
  ArrowUpDown,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Loading from "@/components/ui/loading";

type UserWithoutPassword = {
  id: number;
  username: string;
  email: string;
  name: string;
  company: string | null;
  role: string;
};

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserWithoutPassword | null>(null);
  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = useState(false);

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/admin/users"],
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsChangeRoleDialogOpen(false);
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
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

  // Handle role change
  const handleRoleChange = (role: string) => {
    if (!selectedUser) return;
    updateUserRoleMutation.mutate({ userId: selectedUser.id, role });
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case UserRole.VENDOR:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case UserRole.HR:
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Manage Users</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all users on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="relative flex-grow max-w-md">
              <Input
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    {roleFilter || "All Roles"}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.VENDOR}>Vendor</SelectItem>
                  <SelectItem value={UserRole.HR}>HR</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("");
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center">
                      Role
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell>{userData.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary-50 text-primary text-xs">
                              {getInitials(userData.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{userData.name}</div>
                            <div className="text-sm text-muted-foreground">
                              @{userData.username}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>
                        {userData.company || <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(userData.role)}>
                          {userData.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          open={
                            isChangeRoleDialogOpen && selectedUser?.id === userData.id
                          }
                          onOpenChange={(open) => {
                            setIsChangeRoleDialogOpen(open);
                            if (open) {
                              setSelectedUser(userData);
                            } else {
                              setSelectedUser(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              onClick={() => setSelectedUser(userData)}
                              disabled={userData.id === user?.id}
                              className={
                                userData.id === user?.id
                                  ? "cursor-not-allowed opacity-50"
                                  : ""
                              }
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Change User Role</DialogTitle>
                              <DialogDescription>
                                Update the role for {selectedUser?.name}. This will change their
                                permissions on the platform.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Current Role
                                </label>
                                <Badge
                                  className={`${
                                    selectedUser ? getRoleBadgeColor(selectedUser.role) : ""
                                  }`}
                                >
                                  {selectedUser?.role}
                                </Badge>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  New Role
                                </label>
                                <Select
                                  onValueChange={handleRoleChange}
                                  defaultValue={selectedUser?.role}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                    <SelectItem value={UserRole.VENDOR}>Vendor</SelectItem>
                                    <SelectItem value={UserRole.HR}>HR</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsChangeRoleDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() =>
                                  handleRoleChange(
                                    document.querySelector<HTMLInputElement>(
                                      "[data-radix-select-value]"
                                    )?.value || selectedUser?.role || ""
                                  )
                                }
                                disabled={updateUserRoleMutation.isPending}
                              >
                                {updateUserRoleMutation.isPending
                                  ? "Updating..."
                                  : "Update Role"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="text-sm text-gray-500 mt-4">
            Showing {filteredUsers.length} of {users.length} total users
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
          <CardDescription>
            Breakdown of users by role and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Total Admin Users</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === UserRole.ADMIN).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <User className="h-6 w-6 text-red-600" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Total Vendor Users</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === UserRole.VENDOR).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Total HR Users</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === UserRole.HR).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
