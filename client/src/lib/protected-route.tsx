import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { UserRoleType } from "@shared/schema";
import Loading from "@/components/ui/loading";

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
  fallbackPath = "/auth"
}: {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: UserRoleType;
  fallbackPath?: string;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <Loading />
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to={fallbackPath} />
      </Route>
    );
  }

  // If a specific role is required and user doesn't have it or isn't an admin
  if (requiredRole && user.role !== requiredRole && user.role !== "ADMIN") {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
