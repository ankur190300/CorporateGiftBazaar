import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Gift } from "@shared/schema";

interface GiftCardProps {
  gift: Gift;
}

export default function GiftCard({ gift }: GiftCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price / 100);
  };

  return (
    <Link href={`/gifts/${gift.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <div className="relative">
          <img
            src={gift.imageUrl}
            alt={gift.name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-0 right-0 p-2 flex flex-col gap-2">
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
        <CardContent className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{gift.name}</h3>
          <p className="text-gray-500 text-sm mb-2">{gift.category}</p>
          <div className="flex justify-between items-center mt-auto">
            <span className="text-primary font-bold">{formatPrice(gift.price)}</span>
            {!gift.approved && (
              <Badge variant="outline" className="text-amber-500 border-amber-500">
                Pending
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
