import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { 
  Menu, 
  X, 
  ShoppingCart, 
  Package,
  User as UserIcon,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserRole } from "@shared/schema";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user && user.role === UserRole.HR,
  });

  const cartItemCount = cartItems.length;
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="text-2xl font-bold text-primary">
                  Gift<span className="text-amber-500">Connect</span>
                </a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`${
                  location === "/" 
                    ? "border-primary text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Home
                </a>
              </Link>
              <Link href="/gifts">
                <a className={`${
                  location === "/gifts" 
                    ? "border-primary text-gray-900" 
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Browse Gifts
                </a>
              </Link>
              
              {/* HR-specific nav items */}
              {user && user.role === UserRole.HR && (
                <Link href="/cart">
                  <a className={`${
                    location === "/cart" 
                      ? "border-primary text-gray-900" 
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    My Cart
                  </a>
                </Link>
              )}
              
              {/* Vendor-specific nav items */}
              {user && user.role === UserRole.VENDOR && (
                <Link href="/vendor/products">
                  <a className={`${
                    location === "/vendor/products" 
                      ? "border-primary text-gray-900" 
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                    My Products
                  </a>
                </Link>
              )}
              
              {/* Admin-specific nav items */}
              {user && user.role === UserRole.ADMIN && (
                <>
                  <Link href="/admin/dashboard">
                    <a className={`${
                      location === "/admin/dashboard" 
                        ? "border-primary text-gray-900" 
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/admin/users">
                    <a className={`${
                      location === "/admin/users" 
                        ? "border-primary text-gray-900" 
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      Manage Users
                    </a>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Cart icon (HR only) */}
            {user && user.role === UserRole.HR && (
              <div className="mr-4">
                <Link href="/cart">
                  <a className="p-1 rounded-full text-gray-500 hover:text-primary focus:outline-none">
                    <span className="sr-only">View cart</span>
                    <div className="relative">
                      <ShoppingCart className="h-6 w-6" />
                      {cartItemCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white h-5 w-5 flex items-center justify-center p-0">
                          {cartItemCount}
                        </Badge>
                      )}
                    </div>
                  </a>
                </Link>
              </div>
            )}
            
            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-primary-50 text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs text-gray-500">{user.role}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {user.role === UserRole.HR && (
                    <Link href="/cart">
                      <DropdownMenuItem className="cursor-pointer">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>My Cart</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  
                  {user.role === UserRole.VENDOR && (
                    <Link href="/vendor/products">
                      <DropdownMenuItem className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        <span>My Products</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  
                  {user.role === UserRole.ADMIN && (
                    <Link href="/admin/dashboard">
                      <DropdownMenuItem className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            {user && user.role === UserRole.HR && (
              <Link href="/cart">
                <a className="p-2 text-gray-500 hover:text-primary">
                  <div className="relative">
                    <ShoppingCart className="h-6 w-6" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white h-5 w-5 flex items-center justify-center p-0">
                        {cartItemCount}
                      </Badge>
                    )}
                  </div>
                </a>
              </Link>
            )}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                <div className="flex flex-col h-full">
                  <div className="py-6">
                    {user ? (
                      <div className="flex items-center mb-6">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary-50 text-primary">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.role}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <Link href="/auth">
                          <Button className="w-full">Sign In</Button>
                        </Link>
                      </div>
                    )}
                    
                    <nav className="flex flex-col space-y-4">
                      <Link href="/">
                        <a className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
                          Home
                        </a>
                      </Link>
                      <Link href="/gifts">
                        <a className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
                          Browse Gifts
                        </a>
                      </Link>
                      
                      {/* Role-specific links */}
                      {user && user.role === UserRole.HR && (
                        <Link href="/cart">
                          <a className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
                            My Cart
                          </a>
                        </Link>
                      )}
                      
                      {user && user.role === UserRole.VENDOR && (
                        <Link href="/vendor/products">
                          <a className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
                            My Products
                          </a>
                        </Link>
                      )}
                      
                      {user && user.role === UserRole.ADMIN && (
                        <>
                          <Link href="/admin/dashboard">
                            <a className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
                              Dashboard
                            </a>
                          </Link>
                          <Link href="/admin/users">
                            <a className="px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
                              Manage Users
                            </a>
                          </Link>
                        </>
                      )}
                    </nav>
                    
                    {user && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <button
                          onClick={handleLogout}
                          className="w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
