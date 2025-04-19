import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import GiftCard from "@/components/ui/gift-card";
import { Gift, GiftCategory } from "@shared/schema";
import Loading from "@/components/ui/loading";
import { Search, Filter, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function GiftSearch() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState(params.get("search") || "");
  const [category, setCategory] = useState<string>(params.get("category") || "");
  const [brandable, setBrandable] = useState<boolean>(params.get("brandable") === "true");
  const [ecoFriendly, setEcoFriendly] = useState<boolean>(params.get("ecoFriendly") === "true");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]); // In cents, $0-$200
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Apply filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set("search", searchTerm);
    if (category) params.set("category", category);
    if (brandable) params.set("brandable", "true");
    if (ecoFriendly) params.set("ecoFriendly", "true");
    
    setLocation(`/gifts?${params.toString()}`);
  }, [searchTerm, category, brandable, ecoFriendly, setLocation]);
  
  // Get filtered gifts
  const { data: gifts = [], isLoading } = useQuery<Gift[]>({
    queryKey: ["/api/gifts", { approved: true, category, brandable, ecoFriendly, search: searchTerm }],
  });
  
  // Apply price filter client-side
  const filteredGifts = gifts.filter(
    (gift) => gift.price >= priceRange[0] && gift.price <= priceRange[1]
  );
  
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price / 100);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setCategory("");
    setBrandable(false);
    setEcoFriendly(false);
    setPriceRange([0, 20000]);
    setLocation("/gifts");
  };
  
  // Filters sidebar/panel
  const FiltersPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Categories</h3>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {Object.values(GiftCategory).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Price Range</h3>
        <div className="mt-2">
          <Slider
            value={priceRange}
            min={0}
            max={20000}
            step={500}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="my-6"
          />
          <div className="flex justify-between">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Features</h3>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="brandable" 
            checked={brandable} 
            onCheckedChange={(checked) => setBrandable(checked === true)}
          />
          <Label htmlFor="brandable">Brandable</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="ecoFriendly" 
            checked={ecoFriendly} 
            onCheckedChange={(checked) => setEcoFriendly(checked === true)}
          />
          <Label htmlFor="ecoFriendly">Eco-Friendly</Label>
        </div>
      </div>
      
      <Separator />
      
      <Button onClick={resetFilters} variant="outline" className="w-full">
        Reset Filters
      </Button>
    </div>
  );
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Browse Gifts</h1>
          <p className="text-gray-600 mt-1">
            Find the perfect corporate gifts for your team or clients
          </p>
        </div>
        
        <div className="w-full md:w-auto flex items-center">
          <div className="relative flex-grow md:max-w-md">
            <Input
              placeholder="Search gifts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="ml-2 md:hidden">
                <Filter className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] sm:w-[350px]">
              <div className="h-full py-6">
                <h2 className="text-lg font-semibold mb-6">Filters</h2>
                <FiltersPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop filters */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-6">Filters</h2>
            <FiltersPanel />
          </div>
        </div>
        
        {/* Results */}
        <div className="flex-grow">
          {/* Active filters */}
          {(category || brandable || ecoFriendly || searchTerm) && (
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Active filters:</span>
              
              {searchTerm && (
                <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm flex items-center">
                  Search: {searchTerm}
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="ml-2 text-primary/70 hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {category && (
                <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm flex items-center">
                  {category}
                  <button 
                    onClick={() => setCategory("")}
                    className="ml-2 text-primary/70 hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {brandable && (
                <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm flex items-center">
                  Brandable
                  <button 
                    onClick={() => setBrandable(false)}
                    className="ml-2 text-primary/70 hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {ecoFriendly && (
                <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm flex items-center">
                  Eco-Friendly
                  <button 
                    onClick={() => setEcoFriendly(false)}
                    className="ml-2 text-primary/70 hover:text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters} 
                className="text-sm text-gray-500"
              >
                Clear all
              </Button>
            </div>
          )}
          
          {isLoading ? (
            <Loading />
          ) : filteredGifts.length > 0 ? (
            <>
              <p className="mb-4 text-gray-500">
                Showing {filteredGifts.length} {filteredGifts.length === 1 ? "gift" : "gifts"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGifts.map((gift) => (
                  <GiftCard key={gift.id} gift={gift} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No gifts found</h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
              <Button 
                onClick={resetFilters} 
                variant="outline" 
                className="mt-4"
              >
                Reset all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
