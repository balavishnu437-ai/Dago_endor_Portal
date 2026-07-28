import React, { useState } from 'react';
import { X, AlertTriangle, Ban, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  onConfirmCancel: (orderId: string, reason: string) => Promise<void> | void;
}

const PRESET_REASONS = [
  'Item Out of Stock / Ingredients Unavailable',
  'Kitchen Overwhelmed / Unmanageable Delay',
  'Store Closing Early / Operational Issue',
  'Address Out of Delivery Range',
  'Other Reason',
];

export default function CancelOrderModal({
  isOpen,
  onClose,
  orderId,
  onConfirmCancel,
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !orderId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalReason =
      selectedReason === 'Other Reason'
        ? customReason.trim()
        : customReason.trim()
        ? `${selectedReason}: ${customReason.trim()}`
        : selectedReason;

    if (!finalReason) {
      toast.error('Please select or enter a valid cancellation reason');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirmCancel(orderId, finalReason);
      setCustomReason('');
      onClose();
    } catch (err) {
      toast.error('Failed to cancel order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/30 bg-[#12121a] shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-400 font-bold text-base">
            <AlertTriangle size={18} />
            <span>Cancel Order #{orderId.slice(0, 8)}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-300">
            Please specify a valid reason for cancelling this order. The customer will be notified on WhatsApp.
          </p>

          {/* Preset Reasons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Reason for Cancellation
            </label>
            <div className="space-y-1.5">
              {PRESET_REASONS.map((reason) => {
                const isSel = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl border transition-all flex items-center justify-between ${
                      isSel
                        ? 'border-red-500/50 bg-red-500/15 text-red-300 font-semibold'
                        : 'border-slate-800 bg-[#1a1a2e]/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{reason}</span>
                    {isSel && <CheckCircle2 size={14} className="text-red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes / Custom Reason */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Additional Details {selectedReason === 'Other Reason' ? '(Required)' : '(Optional)'}
            </label>
            <textarea
              rows={3}
              placeholder="Provide extra details for customer notification..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-[#1a1a2e] border border-slate-800 text-white outline-none focus:border-red-500/50"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white"
            >
              Back
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4"
            >
              {submitting ? 'Cancelling...' : 'Confirm Order Cancellation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
