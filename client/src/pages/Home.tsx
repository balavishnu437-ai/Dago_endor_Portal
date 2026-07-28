import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Store, BarChart3, Package, ShoppingCart, CreditCard, Shield } from "lucide-react";
import { startLogin } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Nav */}
      <nav className="container py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">VendorHub</span>
        </div>
        <Button onClick={() => startLogin()} className="shadow-sm">
          Sign In
        </Button>
      </nav>

      {/* Hero */}
      <main className="container">
        <div className="max-w-3xl mx-auto text-center pt-16 pb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-medium mb-8 border border-primary/15">
            <Shield className="h-3.5 w-3.5" />
            Secure & Reliable Vendor Management
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            Your Complete
            <span className="text-primary"> Vendor Portal</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
            Manage your products, track orders, monitor inventory, and analyze earnings — all from one elegant, intuitive dashboard.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={() => startLogin()} size="lg" className="shadow-lg shadow-primary/20 px-8">
              <Store className="mr-2 h-4 w-4" />
              Access Your Dashboard
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 max-w-4xl mx-auto">
          <FeatureCard
            icon={BarChart3}
            title="Analytics Dashboard"
            description="Real-time revenue charts, sales metrics, and performance insights at a glance."
          />
          <FeatureCard
            icon={Package}
            title="Product Management"
            description="Add, edit, and organize your entire product catalog with ease."
          />
          <FeatureCard
            icon={ShoppingCart}
            title="Order Tracking"
            description="Monitor order statuses from pending to delivered with full details."
          />
          <FeatureCard
            icon={Shield}
            title="Inventory Control"
            description="Track stock levels with low-stock alerts and bulk update capabilities."
          />
          <FeatureCard
            icon={CreditCard}
            title="Earnings & Payouts"
            description="Detailed revenue breakdowns by period with full transaction history."
          />
          <FeatureCard
            icon={Store}
            title="Store Settings"
            description="Customize your store profile, contact info, and notification preferences."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          VendorHub &mdash; Elegant Vendor Management Platform
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
