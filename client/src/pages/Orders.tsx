import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ordersApi } from '@/lib/api';
import { useVendor } from '@/contexts/VendorContext';
import {
  ClipboardList,
  Search,
  Loader2,
  Package,
  MapPin,
  Phone,
  ChevronLeft,
  BellRing,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import CancelOrderModal from '@/components/CancelOrderModal';

const statusOptions = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PREPARING: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  OUT_FOR_DELIVERY: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function Orders() {
  const { restaurant, store } = useVendor();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleConfirmCancel = async (orderId: string, reason: string) => {
    try {
      await ordersApi.updateStatus(orderId, 'CANCELLED', reason).catch(() => null);
      toast.success(`Order #${orderId.slice(0, 8)} cancelled: ${reason}`);
      fetchOrders(true);
    } catch (err: any) {
      toast.error('Failed to cancel order');
    }
  };

  const restaurantId = restaurant?.id;
  const storeId = store?.id;

  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await ordersApi.getAll(restaurantId, storeId, statusFilter === 'ALL' ? undefined : statusFilter);
      const fetchedOrders = Array.isArray(data) ? data : [];
      
      // Check if new pending orders arrived
      if (silent && fetchedOrders.some((o: any) => o.status === 'PENDING')) {
        const hasNewPending = fetchedOrders.length > orders.length;
        if (hasNewPending) playNotificationSound();
      }

      setOrders(fetchedOrders);
    } catch (err: any) {
      if (!silent) toast.error('Failed to load live WhatsApp orders');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 6000); // 6 second polling for WhatsApp live orders
    return () => clearInterval(interval);
  }, [restaurantId, storeId, statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders(true);
    } catch (err: any) {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.user?.phoneNumber || '').includes(search)
  );

  const selectedOrderData = orders.find((o) => o.id === selectedOrderId);

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  return (
    <div className="p-6 space-y-6 bg-[#0a0a0f] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#ff6b35]" /> WhatsApp Orders Feed
          </h1>
          <p className="text-sm text-slate-400">
            Real-time incoming customer orders placed via DaGo WhatsApp Assistant
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders()}
            className="border-slate-700 bg-[#1a1a2e] hover:bg-slate-800 text-slate-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Badge className="bg-[#ff6b35]/20 text-[#ff6b35] border-[#ff6b35]/30 text-sm px-3 py-1">
            {orders.length} Total Orders
          </Badge>
        </div>
      </div>

      {/* Filter bar */}
      <Card className="bg-[#12121a] border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by order ID, customer name, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1a1a2e] border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {statusOptions.map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === st
                      ? 'bg-[#ff6b35] text-white shadow-md shadow-[#ff6b35]/20'
                      : 'bg-[#1a1a2e] text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order List */}
        <div className={selectedOrderId ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <Card className="bg-[#12121a] border-slate-800">
            <CardContent className="p-0">
              {loading ? (
                <div className="py-16 flex justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="divide-y divide-slate-800">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`p-4 hover:bg-[#1a1a2e]/60 transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                        selectedOrderId === order.id ? 'bg-[#1a1a2e] border-l-4 border-l-[#ff6b35]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] border border-slate-700 flex items-center justify-center text-[#ff6b35]">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-white flex items-center gap-2">
                            #{order.id.slice(0, 8)}
                            {order.status === 'PENDING' && (
                              <span className="w-2 h-2 rounded-full bg-[#ff6b35] animate-ping" />
                            )}
                          </p>
                          <p className="text-xs text-slate-400">
                            {order.customer?.name || 'WhatsApp Customer'} • {order.createdAt ? format(new Date(order.createdAt), 'MMM d, h:mm a') : 'Just now'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-right">
                        <div>
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
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'PENDING'); }}
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
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'PREPARING'); }}
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
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order.id, 'DELIVERED'); }}
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
                  <BellRing className="h-12 w-12 mx-auto mb-3 opacity-40 text-slate-400" />
                  <p className="text-slate-400 font-medium">No live orders matching criteria</p>
                  <p className="text-xs text-slate-500 mt-1">Orders placed by customers on WhatsApp will display here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Order Details */}
        {selectedOrderId && selectedOrderData && (
          <Card className="bg-[#12121a] border-slate-800 h-fit sticky top-6">
            <CardHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                    onClick={() => setSelectedOrderId(null)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  Order Details
                </CardTitle>
                <Badge className={`text-xs border ${statusColors[selectedOrderData.status]}`}>
                  {selectedOrderData.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 text-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Order ID</p>
                  <p className="font-mono text-white font-semibold">{selectedOrderData.id}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1.5">Update Status</p>
                  <div className="space-y-2">
                    <Select
                      value={selectedOrderData.status}
                      onValueChange={(val) => handleUpdateStatus(selectedOrderData.id, val)}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-full bg-[#1a1a2e] border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12121a] border-slate-800 text-white">
                        {['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Quick Status Action Buttons */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedOrderData.id, 'PENDING')}
                        className={`text-[11px] h-8 px-1 ${
                          selectedOrderData.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold'
                            : 'border-slate-800 bg-[#1a1a2e] text-slate-400 hover:text-amber-400'
                        }`}
                      >
                        In Queue
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedOrderData.id, 'PREPARING')}
                        className={`text-[11px] h-8 px-1 ${
                          selectedOrderData.status === 'PREPARING'
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 font-bold'
                            : 'border-slate-800 bg-[#1a1a2e] text-slate-400 hover:text-indigo-400'
                        }`}
                      >
                        Preparing
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedOrderData.id, 'DELIVERED')}
                        className={`text-[11px] h-8 px-1 ${
                          selectedOrderData.status === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                            : 'border-slate-800 bg-[#1a1a2e] text-slate-400 hover:text-emerald-400'
                        }`}
                      >
                        Completed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCancelOrderId(selectedOrderData.id);
                          setShowCancelModal(true);
                        }}
                        className={`text-[11px] h-8 px-1 ${
                          selectedOrderData.status === 'CANCELLED'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40 font-bold'
                            : 'border-slate-800 bg-[#1a1a2e] text-slate-400 hover:text-red-400'
                        }`}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Total Amount</p>
                  <p className="text-xl font-bold text-[#ff6b35]">{formatCurrency(selectedOrderData.totalAmount || 0)}</p>
                </div>

                <div className="space-y-1 bg-[#1a1a2e] p-3 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#ff6b35]" /> Customer Details
                  </p>
                  <p className="font-semibold text-white">{selectedOrderData.customer?.name || 'WhatsApp User'}</p>
                  <p className="text-xs text-slate-400">{selectedOrderData.customer?.user?.phoneNumber}</p>
                </div>

                {selectedOrderData.deliveryAddress && (
                  <div className="space-y-1 bg-[#1a1a2e] p-3 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#ff6b35]" /> Delivery Address
                    </p>
                    <p className="text-xs text-slate-300">
                      {selectedOrderData.deliveryAddress.addressLine1}, {selectedOrderData.deliveryAddress.city}
                    </p>
                  </div>
                )}
              </div>

              {/* Items List */}
              {selectedOrderData.orderItems && selectedOrderData.orderItems.length > 0 && (
                <div className="border-t border-slate-800 pt-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Order Items</p>
                  <div className="space-y-2">
                    {selectedOrderData.orderItems.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center bg-[#1a1a2e]/50 p-2.5 rounded-lg">
                        <div>
                          <p className="font-semibold text-white text-xs">
                            {item.menuItem?.name || item.storeProduct?.name || 'Item'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Qty: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                        <p className="font-bold text-xs text-slate-200">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

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
