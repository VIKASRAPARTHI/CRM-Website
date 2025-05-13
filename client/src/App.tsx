import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { AuthProvider } from "./lib/auth.tsx";
import NotFound from "@/pages/not-found";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/dashboard";
import CampaignBuilder from "./pages/campaign-builder";
import CampaignHistory from "./pages/campaign-history";
import Customers from "./pages/customers";
import Orders from "./pages/orders";
import LoginPage from "./pages/login";
import ProfilePage from "./pages/profile";
import ApiSettingsPage from "./pages/api-settings";
import GeneralSettingsPage from "./pages/general-settings";
import { useLocation } from "wouter";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check auth status
    fetch("/api/auth/check", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        console.log("Auth check result:", data);
        setIsAuthenticated(data.authenticated);
        if (!data.authenticated) {
          // Redirect to login page if not authenticated
          console.log("Not authenticated, redirecting to /auth");
          setLocation("/auth");
        }
      })
      .catch((error) => {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setLocation("/auth");
      });
  }, [setLocation]);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/auth" component={LoginPage} />

      <Route path="/">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/campaign-builder">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <CampaignBuilder />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/campaign-history">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <CampaignHistory />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/customers">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <Customers />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/orders">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <Orders />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/profile">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/settings/api">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <ApiSettingsPage />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/settings/general">
        {() => (
          <ProtectedRoute>
            <MainLayout>
              <GeneralSettingsPage />
            </MainLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
