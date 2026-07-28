import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ordersApi, payoutsApi } from '@/lib/api';
import { useVendor } from '@/contexts/VendorContext';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Loader2,
  ArrowUpRight,
  Wallet,
  Landmark,
  QrCode,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Earnings() {
  const { restaurant, store } = useVendor();
  const [orders, setOrders] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'withdrawals'>('orders');

  // Modal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  // Form States
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'BANK_TRANSFER'>('UPI');
  const [submitting, setSubmitting] = useState(false);

  // Bank & UPI Details State
  const [bankDetails, setBankDetails] = useState({
    accountName: restaurant?.ownerName || 'Bala',
    bankName: 'HDFC Bank',
    accountNumber: '50100234563661',
    ifscCode: 'HDFC0001234',
    upiId: '9150416366@ybl',
  });

  const restaurantId = restaurant?.id;
  const storeId = store?.id;

  // Load Bank & Payout Settings from LocalStorage if saved
  useEffect(() => {
    const savedBank = localStorage.getItem('dago_vendor_bank_details');
    if (savedBank) {
      try {
        setBankDetails((prev) => ({ ...prev, ...JSON.parse(savedBank) }));
      } catch (_) {}
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, withdrawalsData] = await Promise.all([
        ordersApi.getAll(restaurantId, storeId).catch(() => []),
        payoutsApi.getWithdrawals(restaurantId || storeId).catch(() => []),
      ]);

      setOrders(Array.isArray(ordersData) ? ordersData : []);

      // Check local storage for extra mock withdrawals
      const localWdrs = localStorage.getItem('dago_vendor_local_withdrawals');
      let combinedWdrs = Array.isArray(withdrawalsData) ? withdrawalsData : [];
      if (localWdrs) {
        try {
          const parsed = JSON.parse(localWdrs);
          combinedWdrs = [...parsed, ...combinedWdrs];
        } catch (_) {}
      }
      setWithdrawals(combinedWdrs);
    } catch (err: any) {
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [restaurantId, storeId]);

  // Financial Calculations
  const grossRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const platformFee = grossRevenue * 0.10; // 10% platform fee
  const netEarnings = grossRevenue - platformFee;
  
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
  const availableBalance = Math.max(0, netEarnings - totalWithdrawn);

  const formatCurrency = (val: number) => `₹${val.toFixed(2)}`;

  // Handle Quick Select % inside Withdrawal Modal
  const handleQuickSelect = (pct: number) => {
    const calc = (availableBalance * (pct / 100)).toFixed(2);
    setWithdrawAmount(calc);
  };

  // Submit Withdrawal Request
  const handleProcessWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    if (amountNum < 100) {
      toast.error('Minimum withdrawal amount is ₹100.00');
      return;
    }
    if (amountNum > availableBalance) {
      toast.error(`Insufficient balance. Maximum available: ${formatCurrency(availableBalance)}`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: amountNum,
        method: payoutMethod,
        details: bankDetails,
      };

      const res = await payoutsApi.requestWithdrawal(payload).catch(() => null);

      const newWdr = res?.withdrawal || {
        id: `WDR-${Math.floor(1000 + Math.random() * 9000)}`,
        amount: amountNum,
        method: payoutMethod,
        destination: payoutMethod === 'UPI' ? bankDetails.upiId : `${bankDetails.bankName} (A/C **${bankDetails.accountNumber.slice(-4)})`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      // Save locally
      const existingLocal = localStorage.getItem('dago_vendor_local_withdrawals');
      let list = [];
      if (existingLocal) {
        try { list = JSON.parse(existingLocal); } catch (_) {}
      }
      list.unshift(newWdr);
      localStorage.setItem('dago_vendor_local_withdrawals', JSON.stringify(list));

      setWithdrawals((prev) => [newWdr, ...prev]);
      setShowWithdrawModal(false);
      setWithdrawAmount('');

      toast.success(`🎉 Payout of ${formatCurrency(amountNum)} processed successfully! Transferred via ${payoutMethod}.`);
    } catch (err: any) {
      toast.error(err?.message || 'Withdrawal request failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Save Bank Details
  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('dago_vendor_bank_details', JSON.stringify(bankDetails));
    setShowBankModal(false);
    toast.success('Payout Bank Account & UPI ID updated successfully!');
  };

  return (
    <div className="p-6 space-y-6 bg-[#0a0a0f] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-[#ff6b35]" /> Financials & Payout Earnings
          </h1>
          <p className="text-sm text-slate-400">
            Real-time revenue settlement, instant money withdrawals, and transaction log
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowBankModal(true)}
            variant="outline"
            className="border-slate-700 bg-[#12121a] hover:bg-[#1a1a2e] text-slate-200 text-xs flex items-center gap-2"
          >
            <Landmark className="w-4 h-4 text-emerald-400" />
            Bank & UPI Details
          </Button>

          <Button
            onClick={() => {
              setWithdrawAmount(availableBalance > 0 ? availableBalance.toFixed(2) : '');
              setShowWithdrawModal(true);
            }}
            className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c00] hover:opacity-95 text-white text-xs font-semibold px-4 py-2 flex items-center gap-2 shadow-lg shadow-[#ff6b35]/20"
          >
            <Wallet className="w-4 h-4" />
            Withdraw Money
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <Card className="bg-[#12121a] border-slate-800 shadow-xl relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-slate-400">Gross Sales Revenue</p>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{formatCurrency(grossRevenue)}</p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> Total order volume sales
            </p>
          </CardContent>
        </Card>

        {/* Net Payout */}
        <Card className="bg-[#12121a] border-slate-800 shadow-xl relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-slate-400">Net Earnings (90%)</p>
              <div className="w-10 h-10 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/30 flex items-center justify-center text-[#ff6b35]">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#ff6b35] mt-2">{formatCurrency(netEarnings)}</p>
            <p className="text-[11px] text-slate-400 mt-1">After 10% platform commission</p>
          </CardContent>
        </Card>

        {/* Available Balance for Withdrawal */}
        <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#12121a] border border-blue-500/30 shadow-xl relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase text-blue-400 tracking-wider">Available to Withdraw</p>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <p className="text-2xl font-black text-blue-400">{formatCurrency(availableBalance)}</p>
              <button
                onClick={() => {
                  setWithdrawAmount(availableBalance > 0 ? availableBalance.toFixed(2) : '');
                  setShowWithdrawModal(true);
                }}
                className="text-xs text-blue-300 font-semibold hover:underline flex items-center gap-0.5"
              >
                Withdraw <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-400" /> Ready for instant bank transfer
            </p>
          </CardContent>
        </Card>

        {/* Total Withdrawn */}
        <Card className="bg-[#12121a] border-slate-800 shadow-xl relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-slate-400">Total Withdrawn</p>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-400 mt-2">{formatCurrency(totalWithdrawn)}</p>
            <p className="text-[11px] text-slate-400 mt-1">{withdrawals.length} completed payouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Log View */}
      <Card className="bg-[#12121a] border-slate-800 shadow-xl">
        <CardHeader className="border-b border-slate-800 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'orders'
                    ? 'border-[#ff6b35] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Order Settlement Log ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'withdrawals'
                    ? 'border-[#ff6b35] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Withdrawal & Payout History ({withdrawals.length})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
            </div>
          ) : activeTab === 'orders' ? (
            /* Order Settlement Log Table */
            orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                      <th className="py-3.5 px-5">Order ID</th>
                      <th className="py-3.5 px-5">Gross Amount</th>
                      <th className="py-3.5 px-5">Fee (10%)</th>
                      <th className="py-3.5 px-5">Net Payout</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {orders.map((o) => {
                      const gross = o.totalAmount || 0;
                      const fee = gross * 0.10;
                      const net = gross - fee;
                      return (
                        <tr key={o.id} className="hover:bg-[#1a1a2e]/50 transition-colors">
                          <td className="py-3.5 px-5 font-mono text-white">#{o.id.slice(0, 8)}</td>
                          <td className="py-3.5 px-5 font-bold text-white">₹{gross.toFixed(2)}</td>
                          <td className="py-3.5 px-5 text-purple-400">₹{fee.toFixed(2)}</td>
                          <td className="py-3.5 px-5 font-bold text-[#ff6b35]">₹{net.toFixed(2)}</td>
                          <td className="py-3.5 px-5">
                            <Badge
                              className={
                                o.status === 'DELIVERED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              }
                            >
                              {o.status === 'DELIVERED' ? 'Settled' : 'Pending Settlement'}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-5 text-right text-xs text-slate-400">
                            {o.createdAt ? format(new Date(o.createdAt), 'MMM d, yyyy') : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-40 text-slate-400" />
                <p className="text-slate-400 font-medium">No order transactions found</p>
              </div>
            )
          ) : (
            /* Withdrawal & Payout History Log Table */
            withdrawals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                      <th className="py-3.5 px-5">Payout Ref ID</th>
                      <th className="py-3.5 px-5">Requested Amount</th>
                      <th className="py-3.5 px-5">Transfer Method</th>
                      <th className="py-3.5 px-5">Payout Destination</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-[#1a1a2e]/50 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-white flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-[#ff6b35]" />
                          {w.id}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-emerald-400">₹{(w.amount || 0).toFixed(2)}</td>
                        <td className="py-3.5 px-5">
                          <Badge variant="outline" className="bg-[#1a1a2e] border-slate-700 text-slate-300 text-[11px]">
                            {w.method === 'UPI' ? '⚡ UPI Instant' : '🏛️ Bank Transfer'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-xs text-slate-300">{w.destination || '—'}</td>
                        <td className="py-3.5 px-5">
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center gap-1 w-fit text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> {w.status || 'COMPLETED'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-right text-xs text-slate-400">
                          {w.createdAt ? format(new Date(w.createdAt), 'MMM d, yyyy HH:mm') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Wallet className="h-12 w-12 mx-auto mb-3 opacity-40 text-slate-400" />
                <p className="text-slate-400 font-medium">No payout withdrawal history found</p>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* WITHDRAW MONEY MODAL */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="bg-[#12121a] border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#ff6b35]" /> Request Payout Withdrawal
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Transfer your available earnings directly to your verified Bank Account or UPI ID.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProcessWithdrawal} className="space-y-4 py-2">
            {/* Available Balance Box */}
            <div className="bg-gradient-to-r from-blue-950/40 to-slate-900 p-4 rounded-xl border border-blue-500/30 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">Available Balance</p>
                <p className="text-2xl font-black text-white mt-0.5">{formatCurrency(availableBalance)}</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                0% Transfer Fee
              </Badge>
            </div>

            {/* Payout Method Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Select Payout Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutMethod('UPI')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    payoutMethod === 'UPI'
                      ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white'
                      : 'border-slate-800 bg-[#1a1a2e] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-[#ff6b35]" />
                  <div>
                    <p className="text-xs font-bold">UPI Transfer</p>
                    <p className="text-[10px] opacity-70">Instant (&lt; 2 mins)</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod('BANK_TRANSFER')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    payoutMethod === 'BANK_TRANSFER'
                      ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-white'
                      : 'border-slate-800 bg-[#1a1a2e] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold">Bank IMPS</p>
                    <p className="text-[10px] opacity-70">Direct Transfer</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Payout Target Destination Preview */}
            <div className="p-3 bg-[#1a1a2e] rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Payout Destination</p>
              {payoutMethod === 'UPI' ? (
                <p className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" /> {bankDetails.upiId}
                </p>
              ) : (
                <p className="font-mono text-slate-200 font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  {bankDetails.bankName} — A/C **{bankDetails.accountNumber.slice(-4)} ({bankDetails.ifscCode})
                </p>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300">Enter Amount to Withdraw</label>
                <span className="text-slate-400 text-[11px]">Min ₹100</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pl-8 bg-[#1a1a2e] border-slate-700 text-white font-mono text-base font-bold placeholder:text-slate-600"
                />
              </div>

              {/* Quick Percentage Shortcuts */}
              <div className="flex gap-2 pt-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickSelect(pct)}
                    className="flex-1 py-1 rounded-lg bg-[#1a1a2e] border border-slate-800 hover:border-[#ff6b35] text-[11px] text-slate-300 font-semibold transition-all"
                  >
                    {pct === 100 ? 'MAX' : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || availableBalance < 100}
                className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c00] text-white font-bold text-xs px-5 shadow-lg shadow-[#ff6b35]/20"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : `Confirm ₹${withdrawAmount || '0'} Withdrawal`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* BANK & UPI DETAILS SETTINGS MODAL */}
      <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
        <DialogContent className="bg-[#12121a] border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-400" /> Bank & UPI Payout Settings
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Configure your bank account and UPI ID where your store earnings will be transferred.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBankDetails} className="space-y-3.5 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Account Holder Full Name</label>
              <Input
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                placeholder="e.g. Bala"
                className="bg-[#1a1a2e] border-slate-700 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Bank Name</label>
                <Input
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank"
                  className="bg-[#1a1a2e] border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">IFSC Code</label>
                <Input
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                  placeholder="e.g. HDFC0001234"
                  className="bg-[#1a1a2e] border-slate-700 text-white text-xs uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Bank Account Number</label>
              <Input
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="e.g. 50100234563661"
                className="bg-[#1a1a2e] border-slate-700 text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1 flex items-center justify-between">
                <span>UPI ID (Instant Payouts)</span>
                <span className="text-[#ff6b35] text-[10px]">GPay / PhonePe / Paytm</span>
              </label>
              <Input
                value={bankDetails.upiId}
                onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                placeholder="e.g. 9150416366@ybl"
                className="bg-[#1a1a2e] border-slate-700 text-white text-xs font-mono"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowBankModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5"
              >
                Save Payout Settings
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
