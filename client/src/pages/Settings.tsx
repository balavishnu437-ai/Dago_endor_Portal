import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { restaurantApi } from '@/lib/api';
import { useVendor } from '@/contexts/VendorContext';
import { Store, User, Bell, Loader2, Save, Mail, Phone, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, restaurant, store, setRestaurant } = useVendor();
  const [storeName, setStoreName] = useState(restaurant?.name || store?.name || 'Bala hotel');
  const [description, setDescription] = useState(restaurant?.description || store?.description || 'Authentic Hyperlocal South Indian & Gourmet Kitchen');
  const [contactEmail, setContactEmail] = useState(
    restaurant?.email && restaurant.email !== 'vendor@dago.com'
      ? restaurant.email
      : user?.email && user.email !== 'vendor@dago.com'
      ? user.email
      : 'bala@hotel.com'
  );
  const [contactPhone, setContactPhone] = useState(restaurant?.phoneNumber || user?.phoneNumber || '9150416366');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setStoreName(restaurant.name || 'Bala hotel');
      setDescription(restaurant.description || '');
      setContactEmail(
        restaurant.email && restaurant.email !== 'vendor@dago.com'
          ? restaurant.email
          : user?.email && user.email !== 'vendor@dago.com'
          ? user.email
          : 'bala@hotel.com'
      );
      setContactPhone(restaurant.phoneNumber || user?.phoneNumber || '9150416366');
    }
  }, [restaurant, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      toast.error('Store/Restaurant name is required');
      return;
    }

    setSaving(true);
    try {
      if (restaurant?.id) {
        const updated = await restaurantApi.update(restaurant.id, {
          name: storeName,
          description,
          email: contactEmail,
          phoneNumber: contactPhone,
        });
        if (updated) setRestaurant(updated);
      }
      toast.success('Vendor profile and store settings saved successfully');
    } catch (err: any) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#0a0a0f] min-h-screen text-slate-100 max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Store className="w-6 h-6 text-[#ff6b35]" /> Vendor Profile & Settings
        </h1>
        <p className="text-sm text-slate-400">
          Manage your business information, contact channels, and WhatsApp notification preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vendor Profile */}
        <Card className="bg-[#12121a] border-slate-800 shadow-xl">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#ff6b35]" /> Account Profile
            </CardTitle>
            <CardDescription className="text-slate-400">Registered vendor user information</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 bg-[#1a1a2e] p-4 rounded-xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-[#ff6b35]/20 border border-[#ff6b35]/40 flex items-center justify-center text-[#ff6b35] text-lg font-bold">
                {user?.phoneNumber?.slice(-2) || 'V'}
              </div>
              <div>
                <p className="font-bold text-white">{storeName || 'DaGo Vendor'}</p>
                <p className="text-xs text-slate-400">Role: <span className="text-slate-200 uppercase">{user?.role || 'RESTAURANT'}</span></p>
                <p className="text-xs text-slate-400">Phone: <span className="text-slate-200">{user?.phoneNumber}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Info */}
        <Card className="bg-[#12121a] border-slate-800 shadow-xl">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-[#ff6b35]" /> Store Information
            </CardTitle>
            <CardDescription className="text-slate-400">Information displayed to customers on WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="storeName" className="text-xs uppercase font-semibold text-slate-300">Store / Restaurant Name</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="bg-[#1a1a2e] border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="desc" className="text-xs uppercase font-semibold text-slate-300">Business Description</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-[#1a1a2e] border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs uppercase font-semibold text-slate-300">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="bg-[#1a1a2e] border-slate-700 text-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs uppercase font-semibold text-slate-300">Contact Phone</Label>
                <Input
                  id="phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="bg-[#1a1a2e] border-slate-700 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={saving} className="bg-[#ff6b35] hover:bg-[#e05a2b] text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-[#ff6b35]/20">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
