import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { VendorProvider, useVendor } from "./contexts/VendorContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Earnings from "./pages/Earnings";
import Settings from "./pages/Settings";
import DeliveryZones from "./pages/DeliveryZones";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PendingVerification from "./pages/PendingVerification";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading, restaurant } = useVendor();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f] text-slate-100">
        <div className="w-6 h-6 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // If vendor application is registered but not verified by Admin yet
  if (restaurant && restaurant.isVerified === false) {
    return <Redirect to="/pending-verification" />;
  }

  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/pending-verification" component={PendingVerification} />
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/products">
        <ProtectedRoute component={Products} />
      </Route>
      <Route path="/orders">
        <ProtectedRoute component={Orders} />
      </Route>
      <Route path="/delivery-zones">
        <ProtectedRoute component={DeliveryZones} />
      </Route>
      <Route path="/inventory">
        <ProtectedRoute component={Inventory} />
      </Route>
      <Route path="/earnings">
        <ProtectedRoute component={Earnings} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <VendorProvider>
          <TooltipProvider>
            <Toaster position="top-right" theme="dark" />
            <Router />
          </TooltipProvider>
        </VendorProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
