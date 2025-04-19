import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">404 Page Not Found</h1>
            <p className="mt-2 text-gray-600">
              We couldn't find the page you're looking for. The page might have been removed, 
              renamed, or is temporarily unavailable.
            </p>
          </div>
          
          <Link href="/">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
