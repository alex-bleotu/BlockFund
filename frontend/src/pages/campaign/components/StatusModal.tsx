import { AlertTriangle } from "lucide-react";

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    currentStatus: string;
    loading?: boolean;
}

export function StatusModal({
    isOpen,
    onClose,
    onConfirm,
    currentStatus,
    loading,
}: StatusModalProps) {
    if (!isOpen) return null;

    const newStatus = currentStatus === "active" ? "inactive" : "active";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-surface rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-warning" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-text text-center mb-2">
                    Change Campaign Status
                </h3>
                <p className="text-text-secondary text-center mb-6">
                    Are you sure you want to mark this campaign as {newStatus}?
                    {currentStatus === "active"
                        ? " This will prevent further contributions to your campaign."
                        : " This will allow contributions to your campaign again."}
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text transition-colors"
                        disabled={loading}>
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-primary text-light rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                        disabled={loading}>
                        {loading ? "Updating..." : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}
