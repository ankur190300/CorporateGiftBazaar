import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gift, GiftCategory } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import GiftCard from "@/components/ui/gift-card";
import Loading from "@/components/ui/loading";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HampersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch all gifts
  const { data: gifts = [], isLoading } = useQuery<Gift[]>({
    queryKey: ["/api/gifts", { approved: true }],
  });
  
  // Filter only hamper/gift basket items
  // We can identify hampers by looking for keywords in the name or description
  const hampers = gifts.filter((gift) => {
    const nameLower = gift.name.toLowerCase();
    const descLower = gift.description.toLowerCase();
    const searchTerms = ["hamper", "basket", "gift set", "gift basket", "collection", "bundle"];
    
    return searchTerms.some(term => 
      nameLower.includes(term) || descLower.includes(term)
    ) || gift.category === GiftCategory.FOOD;
  });
  
  // Filter by search term if provided
  const filteredHampers = searchTerm 
    ? hampers.filter(hamper => 
        hamper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hamper.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : hampers;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gift Hampers & Baskets</h1>
          <p className="text-gray-600 mt-1">
            Premium gift baskets and hampers for special corporate occasions
          </p>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      {isLoading ? (
        <Loading />
      ) : filteredHampers.length > 0 ? (
        <>
          <p className="mb-6 text-gray-500">
            Showing {filteredHampers.length} gift baskets and hampers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHampers.map((hamper) => (
              <GiftCard key={hamper.id} gift={hamper} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No hampers found</h3>
          <p className="mt-1 text-gray-500">
            We couldn't find any gift hampers or baskets matching your criteria.
          </p>
          <Button 
            onClick={() => setSearchTerm("")} 
            variant="outline" 
            className="mt-4"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}