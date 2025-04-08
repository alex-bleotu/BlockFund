import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  campaignTitle: string;
}

export function DeleteCampaignModal({
  isOpen,
  onClose,
  onConfirm,
  campaignTitle
}: DeleteCampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: any) {
      console.error('Error deleting campaign:', err);
      setError(err.message || 'Failed to delete campaign');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md rounded-xl bg-surface p-6 shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 text-text-secondary hover:text-text transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-error-light flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">Delete Campaign</h2>
                <p className="text-text-secondary">This action cannot be undone</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-error-light text-error text-sm">
                {error}
              </div>
            )}

            <p className="text-text-secondary mb-6">
              Are you sure you want to delete "{campaignTitle}"? All campaign data will be permanently removed.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-text-secondary hover:text-text transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-6 py-2 bg-error text-light rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Campaign'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}