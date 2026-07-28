import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Trash2, ShieldAlert, Check, Loader2 } from 'lucide-react';
import { deliveryZoneApi } from '@/lib/api';
import { useVendor } from '@/contexts/VendorContext';
import { toast } from 'sonner';

export default function DeliveryZones() {
  const { restaurant } = useVendor();
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newZoneName, setNewZoneName] = useState('');
  const [newRadius, setNewRadius] = useState('5');
  const [newCharge, setNewCharge] = useState('30');
  const [newMinOrder, setNewMinOrder] = useState('0');

  const restaurantId = restaurant?.id || 'default-restaurant-id';

  const fetchZones = async () => {
    setLoading(true);
    try {
      const data = await deliveryZoneApi.getByRestaurant(restaurantId);
      setZones(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Failed to load delivery zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, [restaurantId]);

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) {
      toast.error('Please specify a zone name');
      return;
    }

    try {
      await deliveryZoneApi.create({
        restaurantId,
        name: newZoneName,
        radius: parseFloat(newRadius),
        deliveryCharge: parseFloat(newCharge),
        minOrder: parseFloat(newMinOrder),
        isActive: true,
      });
      toast.success('Delivery zone created');
      setNewZoneName('');
      fetchZones();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create zone');
    }
  };

  const handleToggleZone = async (id: string, currentActive: boolean) => {
    try {
      await deliveryZoneApi.toggle(id, !currentActive);
      setZones((prev) =>
        prev.map((z) => (z.id === id ? { ...z, isActive: !currentActive } : z))
      );
      toast.success('Zone status updated');
    } catch (err: any) {
      toast.error('Failed to update zone');
    }
  };

  const handleDeleteZone = async (id: string) => {
    try {
      await deliveryZoneApi.delete(id);
      setZones((prev) => prev.filter((z) => z.id !== id));
      toast.success('Delivery zone removed');
    } catch (err: any) {
      toast.error('Failed to delete zone');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#0a0a0f] min-h-screen text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#ff6b35]" /> Delivery Zones & Fees
          </h1>
          <p className="text-sm text-slate-400">
            Configure delivery coverage radius, pricing rules, and locality boundaries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Zone Form */}
        <Card className="bg-[#12121a] border-slate-800 shadow-xl h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Add Delivery Zone</CardTitle>
            <CardDescription className="text-slate-400">Define radius & delivery charge rules</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddZone} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zoneName" className="text-xs uppercase font-semibold text-slate-300">Zone Name</Label>
                <Input
                  id="zoneName"
                  placeholder="e.g. City Core (5km Radius)"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="bg-[#1a1a2e] border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="radius" className="text-xs uppercase font-semibold text-slate-300">Radius (km)</Label>
                <Input
                  id="radius"
                  type="number"
                  step="0.5"
                  value={newRadius}
                  onChange={(e) => setNewRadius(e.target.value)}
                  className="bg-[#1a1a2e] border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="charge" className="text-xs uppercase font-semibold text-slate-300">Delivery Charge (₹)</Label>
                <Input
                  id="charge"
                  type="number"
                  value={newCharge}
                  onChange={(e) => setNewCharge(e.target.value)}
                  className="bg-[#1a1a2e] border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minOrder" className="text-xs uppercase font-semibold text-slate-300">Min Order Value (₹)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={newMinOrder}
                  onChange={(e) => setNewMinOrder(e.target.value)}
                  className="bg-[#1a1a2e] border-slate-700 text-white"
                />
              </div>

              <Button type="submit" className="w-full bg-[#ff6b35] hover:bg-[#e05a2b] text-white">
                <Plus className="w-4 h-4 mr-2" /> Add Zone
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Zones List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-[#12121a] border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Configured Zones</CardTitle>
              <CardDescription className="text-slate-400">Active delivery regions for WhatsApp orders</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 flex justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" />
                </div>
              ) : zones.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No delivery zones configured yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {zones.map((zone) => (
                    <div
                      key={zone.id}
                      className="p-4 bg-[#1a1a2e] border border-slate-800 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{zone.name}</span>
                          <Badge
                            className={
                              zone.isActive
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }
                          >
                            {zone.isActive ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          Radius: <span className="text-slate-200">{zone.radius} km</span> • Fee: <span className="text-slate-200">₹{zone.deliveryCharge}</span> • Min Order: <span className="text-slate-200">₹{zone.minOrder}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Switch
                          checked={zone.isActive}
                          onCheckedChange={() => handleToggleZone(zone.id, zone.isActive)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteZone(zone.id)}
                          className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
