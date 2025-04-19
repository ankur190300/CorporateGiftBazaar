import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import GiftSearch from "@/pages/gift-search";
import GiftDetail from "@/pages/gift-detail";
import CartPage from "@/pages/cart-page";
import VendorProducts from "@/pages/vendor-products";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import HampersPage from "@/pages/hampers-page";
import CustomHamperChatbot from "@/pages/premium-gifts-page";
import { ProtectedRoute } from "@/lib/protected-route";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { UserRole } from "@shared/schema";

function Router() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/gifts" component={GiftSearch} />
          <Route path="/gifts/:id" component={GiftDetail} />
          <Route path="/hampers" component={HampersPage} />
          <Route path="/custom-hamper" component={CustomHamperChatbot} />
          <ProtectedRoute 
            path="/cart" 
            component={CartPage} 
            requiredRole={UserRole.HR}
            fallbackPath="/auth" 
          />
          <ProtectedRoute 
            path="/vendor/products" 
            component={VendorProducts} 
            requiredRole={UserRole.VENDOR}
            fallbackPath="/auth" 
          />
          <ProtectedRoute 
            path="/admin/dashboard" 
            component={AdminDashboard} 
            requiredRole={UserRole.ADMIN}
            fallbackPath="/auth" 
          />
          <ProtectedRoute 
            path="/admin/users" 
            component={AdminUsers} 
            requiredRole={UserRole.ADMIN}
            fallbackPath="/auth" 
          />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
