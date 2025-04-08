import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessages } from '../hooks/useMessages';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  campaignId: string;
  creatorId: string;
}

export function ContactModal({ isOpen, onClose, creatorName, campaignId, creatorId }: ContactModalProps) {
  const { sendMessage } = useMessages();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await sendMessage(campaignId, creatorId, subject, content);

    if (result.success) {
      setSuccess(true);
      setSubject('');
      setContent('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } else {
      setError(result.error || 'Failed to send message');
    }
    setLoading(false);
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
            className="relative w-full max-w-lg rounded-xl bg-surface p-6 shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 text-text-secondary hover:text-text transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold text-text mb-6">Contact {creatorName}</h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-error-light text-error">
                {error}
              </div>
            )}

            {success ? (
              <div className="p-4 text-center">
                <div className="text-success mb-2">Message sent successfully!</div>
                <p className="text-text-secondary">
                  The creator will be notified and can respond to your message.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text"
                    placeholder="Enter subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-text resize-none"
                    placeholder="Type your message here..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-text-secondary hover:text-text transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}