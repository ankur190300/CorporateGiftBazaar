import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GiftCategory } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import GiftCard from "@/components/ui/gift-card";
import CategoryCard from "@/components/ui/category-card";
import { Card, CardContent } from "@/components/ui/card";
import { Star, AlertCircle, Check } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("hr");

  // Fetch featured gifts
  const { data: featuredGifts = [], isLoading } = useQuery({
    queryKey: ["/api/gifts", { approved: true }],
  });

  const displayedGifts = featuredGifts.slice(0, 4);
  const categories = Object.values(GiftCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-amber-200 rounded-xl overflow-hidden shadow-xl mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Thoughtful Corporate Gifting Made Simple
            </h1>
            <p className="text-gray-700 text-lg mb-8">
              Connect your company with unique, high-quality gifts that leave lasting impressions on employees, clients, and partners.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/gifts">
                <Button size="lg" className="px-6 py-6 h-auto">
                  Browse Gifts
                </Button>
              </Link>
              {!user && (
                <Link href="/auth">
                  <Button variant="outline" size="lg" className="px-6 py-6 h-auto">
                    Sign Up Free
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="md:w-1/2 p-6 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Corporate gift box with branded items" 
              className="rounded-lg shadow-lg max-h-80 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="mb-12">
        <div className="border-b border-gray-200 mb-8">
          <div className="flex flex-wrap -mb-px">
            <button 
              onClick={() => setActiveTab("hr")} 
              className={`inline-block p-4 border-b-2 font-medium ${
                activeTab === "hr" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              For HR Teams
            </button>
            <button 
              onClick={() => setActiveTab("vendor")} 
              className={`inline-block p-4 border-b-2 font-medium ${
                activeTab === "vendor" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              For Vendors
            </button>
            <button 
              onClick={() => setActiveTab("admin")} 
              className={`inline-block p-4 border-b-2 font-medium ${
                activeTab === "admin" 
                  ? "border-primary text-primary" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              For Admins
            </button>
          </div>
        </div>

        {/* HR Tab Content */}
        {activeTab === "hr" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">Simplify Your Corporate Gifting</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
                    <Check />
                  </div>
                  <p className="text-gray-700">Browse a curated selection of high-quality corporate gifts</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
                    <Check />
                  </div>
                  <p className="text-gray-700">Easily filter by price, category, brandability, and eco-friendliness</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
                    <Check />
                  </div>
                  <p className="text-gray-700">Create gifting requests with just a few clicks</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
                    <Check />
                  </div>
                  <p className="text-gray-700">Track your gifting history and budget in one place</p>
                </li>
              </ul>
              <Link href={user ? "/gifts" : "/auth"}>
                <Button className="mt-6">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80" 
                alt="HR professional selecting gifts" 
                className="rounded-lg shadow-md max-h-72 object-cover"
              />
            </div>
          </div>
        )}

        {/* Vendor Tab Content */}
        {activeTab === "vendor" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">Grow Your Gift Business</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
                    <Check />
                  </div>
                  <p className="text-gray-700">Showcase your products to corporate buyers across industries</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
                    <Check />
                  </div>
                  <p className="text-gray-700">Manage your product listings with an easy-to-use dashboard</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
                    <Check />
                  </div>
                  <p className="text-gray-700">Receive direct gifting requests from HR professionals</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
                    <Check />
                  </div>
                  <p className="text-gray-700">Track metrics and improve your business performance</p>
                </li>
              </ul>
              <Link href={user && user.role === "VENDOR" ? "/vendor/products" : "/auth"}>
                <Button className="mt-6">
                  Become a Vendor
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Vendor preparing gift products" 
                className="rounded-lg shadow-md max-h-72 object-cover"
              />
            </div>
          </div>
        )}

        {/* Admin Tab Content */}
        {activeTab === "admin" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4">Complete Platform Management</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
                    <Check />
                  </div>
                  <p className="text-gray-700">Review and approve vendor product listings</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
                    <Check />
                  </div>
                  <p className="text-gray-700">Manage all platform users and their permissions</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
                    <Check />
                  </div>
                  <p className="text-gray-700">Access detailed analytics and platform usage metrics</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 text-primary mr-2">
                    <Check />
                  </div>
                  <p className="text-gray-700">Ensure platform quality and adherence to standards</p>
                </li>
              </ul>
              <Link href={user && user.role === "ADMIN" ? "/admin/dashboard" : "/auth"}>
                <Button className="mt-6">
                  Admin Portal
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Admin reviewing platform metrics" 
                className="rounded-lg shadow-md max-h-72 object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Featured Gifts Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Featured Gifts</h2>
          <Link href="/gifts">
            <a className="text-primary hover:text-primary/90 font-medium">
              View All →
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden h-full">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="h-6 w-3/4 bg-gray-200 animate-pulse mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-200 animate-pulse mb-4"></div>
                  <div className="h-5 w-1/4 bg-gray-200 animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : displayedGifts.length > 0 ? (
            displayedGifts.map((gift) => (
              <GiftCard key={gift.id} gift={gift} />
            ))
          ) : (
            <div className="col-span-full py-10 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No gifts found</h3>
              <p className="mt-1 text-gray-500">Check back soon for new gift options.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Categories Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-primary mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category} category={category} />
          ))}
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="mb-12 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-primary mb-8 text-center">What Our Users Say</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col">
            <div className="text-yellow-400 mb-3 flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="fill-current" size={18} />
              ))}
            </div>
            <p className="text-gray-700 mb-4 italic">"GiftConnect has streamlined our entire corporate gifting process. The platform is intuitive and the selection of gifts is impressive."</p>
            <div className="mt-auto">
              <p className="font-semibold text-gray-800">Sarah Johnson</p>
              <p className="text-gray-500 text-sm">HR Director at TechCorp</p>
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="text-yellow-400 mb-3 flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="fill-current" size={18} />
              ))}
            </div>
            <p className="text-gray-700 mb-4 italic">"As a vendor, I've seen my corporate sales increase by 35% since joining GiftConnect. The platform makes it so easy to showcase our products."</p>
            <div className="mt-auto">
              <p className="font-semibold text-gray-800">Michael Chen</p>
              <p className="text-gray-500 text-sm">Owner, Artisan Crafts Co.</p>
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="text-yellow-400 mb-3 flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={i === 4 ? "" : "fill-current"} size={18} />
              ))}
            </div>
            <p className="text-gray-700 mb-4 italic">"The admin tools are powerful yet easy to use. We're able to maintain high quality standards while scaling our platform rapidly."</p>
            <div className="mt-auto">
              <p className="font-semibold text-gray-800">Alex Rodriguez</p>
              <p className="text-gray-500 text-sm">Platform Manager, GiftConnect</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-primary rounded-xl overflow-hidden shadow-xl mb-12 text-white">
        <div className="p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your corporate gifting?</h2>
          <p className="text-primary-50 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of companies who have simplified their gifting process with GiftConnect.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={user ? "/gifts" : "/auth"}>
              <Button className="px-6 py-6 h-auto bg-white text-primary hover:bg-amber-200">
                {user ? "Browse Gifts" : "Sign Up Now"}
              </Button>
            </Link>
            <Button variant="outline" className="px-6 py-6 h-auto border-white text-white hover:bg-primary-600">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
