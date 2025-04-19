import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Coffee,
  Shirt,
  Laptop,
  Leaf,
  Gift,
  Briefcase,
  Heart,
  Plane,
} from "lucide-react";
import { GiftCategory } from "@shared/schema";

interface CategoryCardProps {
  category: string;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case GiftCategory.DRINKWARE:
        return <Coffee className="text-primary text-xl" />;
      case GiftCategory.APPAREL:
        return <Shirt className="text-primary text-xl" />;
      case GiftCategory.TECH:
        return <Laptop className="text-primary text-xl" />;
      case GiftCategory.ECO:
        return <Leaf className="text-primary text-xl" />;
      case GiftCategory.OFFICE:
        return <Briefcase className="text-primary text-xl" />;
      case GiftCategory.WELLNESS:
        return <Heart className="text-primary text-xl" />;
      case GiftCategory.FOOD:
        return <Coffee className="text-primary text-xl" />;
      case GiftCategory.TRAVEL:
        return <Plane className="text-primary text-xl" />;
      default:
        return <Gift className="text-primary text-xl" />;
    }
  };

  return (
    <Link href={`/gifts?category=${category}`}>
      <Card className="p-4 flex flex-col items-center hover:shadow-lg transition-shadow cursor-pointer">
        <div className="h-12 w-12 bg-amber-200 rounded-full flex items-center justify-center mb-3">
          {getCategoryIcon(category)}
        </div>
        <h3 className="text-gray-800 font-medium text-center">{category}</h3>
      </Card>
    </Link>
  );
}
