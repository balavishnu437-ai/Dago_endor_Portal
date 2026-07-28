import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, Lock, Phone, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useVendor } from '@/contexts/VendorContext';
import { toast } from 'sonner';

export default function Login() {
  const [, navigate] = useLocation();
  const { loginSession } = useVendor();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error('Please enter both phone number and password');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({ phoneNumber: phone, password });
      if (res && res.access_token) {
        loginSession(
          res.access_token,
          res.user || { id: 'vendor-1', phoneNumber: phone, role: 'RESTAURANT' },
          res.user?.restaurant,
          res.user?.store
        );
        toast.success('Successfully logged into DaGo Vendor Portal');
        navigate('/');
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff6b35]/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md bg-[#12121a] border-slate-800 backdrop-blur-md shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-14 h-14 bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-2xl flex items-center justify-center text-[#ff6b35] mb-2 shadow-inner">
            <Store className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            DaGo Vendor Portal
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Sign in to manage your restaurant, orders, and delivery settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="phone"
                  type="text"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 bg-[#1a1a2e] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-[#1a1a2e] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff6b35] hover:bg-[#e05a2b] text-white font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b35]/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                New Vendor?{' '}
                <a href="/register" className="text-[#ff6b35] hover:underline font-semibold">
                  Register Your Store (A-to-Z Signup)
                </a>
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-500 border-t border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Secured DaGo Hyperlocal Commerce System</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
