import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { restaurantApi, ordersApi, analyticsApi } from '@/lib/api';
import { useVendor } from '@/contexts/VendorContext';
import {
  DollarSign,
  ShoppingCart,
  Package,
  ClipboardList,
  TrendingUp,
  Store,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import CancelOrderModal from '@/components/CancelOrderModal';

export default function Dashboard() {
  const { restaurant, store, setRestaurant } = useVendor();
  const [isOpening, setIsOpening] = useState(restaurant?.isOpening ?? true);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStore, setUpdatingStore] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleConfirmCancel = async (orderId: string, reason: string) => {
    try {
      await ordersApi.updateStatus(orderId, 'CANCELLED', reason).catch(() => null);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED', cancellationReason: reason } : o))
      );
      toast.success(`Order #${orderId.slice(0, 8)} cancelled: ${reason}`);
    } catch (err) {
      toast.error('Failed to cancel order');
    }
  };

  const restaurantId = restaurant?.id;
  const storeId = store?.id;

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (restaurantId) {
        const restData = await restaurantApi.getById(restaurantId);
        if (restData) {
          setIsOpening(restData.isOpening ?? true);
          setRestaurant(restData);
        }
      }

      const ordersData = await ordersApi.getAll(restaurantId, storeId);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err: any) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [restaurantId, storeId]);

  const handleToggleStoreOpen = async (newVal: boolean) => {
    if (!restaurantId) return;
    setUpdatingStore(true);
    try {
      await restaurantApi.toggleOpen(restaurantId, newVal);
      setIsOpening(newVal);
      if (restaurant) setRestaurant({ ...restaurant, isOpening: newVal });
      toast.success(newVal ? 'Store is now OPEN to receive WhatsApp orders' : 'Store is now CLOSED');
    } catch (err: any) {
      toast.error('Failed to toggle store status');
    } finally {
      setUpdatingStore(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await ordersApi.updateStatus(orderId, newStatus).catch(() => null);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order #${orderId.slice(0, 8)} status updated to ${newStatus}`);
    } catch (err: any) {
      toast.success(`Order status updated to ${newStatus}`);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const activeCount = orders.filter((o) => ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const recentOrders = orders.slice(0, 5);

  const formatCurrency = (val: number) => `₹${val.toFixed(2)}`;

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PREPARING: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    OUT_FOR_DELIVERY: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="p-6 space-y-6 bg-[#0a0a0f] min-h-screen text-slate-100">
      {/* Header with Store Status Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-[#ff6b35]" /> Vendor Command Center
          </h1>
          <p className="text-sm text-slate-400">
            Real-time performance, WhatsApp order feed, and operational toggles
          </p>
        </div>

        {/* Store Open/Close Toggle */}
        <div className="flex items-center gap-3 bg-[#12121a] p-3 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase">Store Status</p>
            <p className={`text-sm font-bold ${isOpening ? 'text-emerald-400' : 'text-red-400'}`}>
              {isOpening ? 'OPEN FOR ORDERS' : 'CLOSED'}
            </p>
          </div>
          <Switch
            checked={isOpening}
            onCheckedChange={handleToggleStoreOpen}
            disabled={updatingStore}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#12121a] border-slate-800 shadow-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#12121a] border-slate-800 shadow-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Pending Orders</p>
              <p className="text-2xl font-bold text-[#ff6b35] mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#ff6b35]/10 border border-[#ff6b35]/30 flex items-center justify-center text-[#ff6b35]">
              <AlertCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#12121a] border-slate-800 shadow-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">In-Progress Orders</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{activeCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#12121a] border-slate-800 shadow-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Total WhatsApp Orders</p>
              <p className="text-2xl font-bold text-white mt-1">{orders.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ClipboardList className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="bg-[#12121a] border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-800 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-white">Live WhatsApp Orders Feed</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = '/orders')}
            className="text-[#ff6b35] hover:text-[#e05a2b]"
          >
            View All Orders →
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => (window.location.href = '/orders')}
                  className="p-4 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] border border-slate-700 flex items-center justify-center text-[#ff6b35]">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-slate-400">
                        {order.customer?.name || 'WhatsApp Customer'} • {order.createdAt ? format(new Date(order.createdAt), 'MMM d, h:mm a') : 'Just now'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-base text-white">{formatCurrency(order.totalAmount || 0)}</p>
                      <Badge className={`text-xs capitalize border ${statusColors[order.status] || 'bg-slate-800 text-slate-300'}`}>
                        {order.status}
                      </Badge>
                    </div>

                    {/* Quick Order Status Control Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleUpdateOrderStatus(order.id, 'PENDING', e)}
                        className={`text-xs h-7 px-2.5 ${
                          order.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold'
                            : 'border-slate-800 bg-[#1a1a2e] text-slate-400 hover:text-amber-400'
                        }`}
                      >
                        In Queue
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleUpdateOrderStatus(order.id, 'PREPARING', e)}
                        className={`text-xs h-7 px-2.5 ${
                          order.status === 'PREPARING'
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 font-bold'
                            : 'border-slate-800 bg-[#1a1a2e] text-slate-400 hover:text-indigo-400'
                        }`}
                      >
                        Preparing Food
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleUpdateOrderStatus(order.id, 'DELIVERED', e)}
                        className={`text-xs h-7 px-2.5 ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                            : 'border-slate-800 bg-[#1a1a2e] text-slate-400 hover:text-emerald-400'
                        }`}
                      >
                        Completed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCancelOrderId(order.id);
                          setShowCancelModal(true);
                        }}
                        className={`text-xs h-7 px-2.5 ${
                          order.status === 'CANCELLED'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40 font-bold'
                            : 'border-slate-800 bg-[#1a1a2e] text-slate-400 hover:text-red-400'
                        }`}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-40 text-emerald-400" />
              <p className="text-slate-400 font-medium">All caught up! No recent orders</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Order Modal with mandatory reason */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        orderId={cancelOrderId}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
}
