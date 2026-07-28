import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ShieldAlert, LogOut, CheckCircle2, PhoneCall, RefreshCw } from 'lucide-react';
import { useVendor } from '@/contexts/VendorContext';
import { restaurantApi } from '@/lib/api';
import { toast } from 'sonner';

export default function PendingVerification() {
  const { logout, restaurant, user, setRestaurant } = useVendor();

  const handleCheckStatus = async () => {
    try {
      const profile = await restaurantApi.getProfile().catch(() => null);
      const savedRest = localStorage.getItem('dago_vendor_restaurant');
      let isVerifiedInStorage = false;
      if (savedRest) {
        try {
          const parsed = JSON.parse(savedRest);
          isVerifiedInStorage = parsed.isVerified || parsed.isOpening || parsed.status === 'approved';
        } catch (_) {}
      }

      if (profile?.isVerified || profile?.isOpening || profile?.status === 'approved' || isVerifiedInStorage) {
        if (restaurant) {
          const updatedRest = { ...restaurant, isVerified: true, isOpening: true, isActive: true, status: 'approved' };
          setRestaurant(updatedRest as any);
          localStorage.setItem('dago_vendor_restaurant', JSON.stringify(updatedRest));
        }
        toast.success('🎉 Congratulations! Your store has been verified by Admin.');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 300);
      } else {
        toast.info('Verification in progress. Awaiting Admin review.');
      }
    } catch {
      window.location.reload();
    }
  };

  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const profile = await restaurantApi.getProfile().catch(() => null);
        const savedRest = localStorage.getItem('dago_vendor_restaurant');
        let isVerifiedInStorage = false;
        if (savedRest) {
          try {
            const parsed = JSON.parse(savedRest);
            isVerifiedInStorage = parsed.isVerified || parsed.isOpening || parsed.status === 'approved';
          } catch (_) {}
        }
        if (profile?.isVerified || profile?.isOpening || profile?.status === 'approved' || isVerifiedInStorage) {
          if (restaurant) {
            const updatedRest = { ...restaurant, isVerified: true, isOpening: true, isActive: true, status: 'approved' };
            setRestaurant(updatedRest as any);
            localStorage.setItem('dago_vendor_restaurant', JSON.stringify(updatedRest));
          }
          toast.success('🎉 Congratulations! Your store has been verified by Admin.');
          window.location.href = '/dashboard';
        }
      } catch (_) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [restaurant, setRestaurant]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-lg bg-[#12121a] border-slate-800 shadow-2xl relative z-10 text-center">
        <CardHeader className="space-y-3 pb-4">
          <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 shadow-inner">
            <Clock className="w-9 h-9 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Application Pending Verification
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Your vendor account <span className="text-white font-semibold">{restaurant?.name || user?.phoneNumber}</span> has been submitted and is currently under Admin review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-[#1a1a2e] p-4 rounded-xl border border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
              <span className="font-semibold text-slate-400 uppercase">Verification Step</span>
              <span className="text-amber-400 font-bold">Admin Reviewing</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>A-to-Z Registration Details Received</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>FSSAI & Business License Uploaded</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Awaiting Admin "Verify" Click for Portal & WhatsApp Web</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Once the Admin verifies your store, your vendor portal will automatically unlock and your menu card will be discoverable on WhatsApp Web.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={handleCheckStatus}
              className="border-slate-700 bg-[#1a1a2e] hover:bg-slate-800 text-slate-200 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Check Status
            </Button>
            <Button
              variant="ghost"
              onClick={logout}
              className="text-slate-400 hover:text-red-400 text-xs"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
