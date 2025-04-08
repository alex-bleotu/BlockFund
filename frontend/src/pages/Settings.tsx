import {
    AlertTriangle,
    Bell,
    Key,
    Lock,
    Shield,
    User,
    Wallet,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";

type SettingsTab = "profile" | "notifications" | "security" | "wallet";

export function Settings() {
    const { user } = useAuth();
    const {
        address,
        loading: walletLoading,
        error: walletError,
        connectWallet,
        disconnectWallet,
    } = useWallet();
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [notifications, setNotifications] = useState({
        emailUpdates: true,
        campaignAlerts: true,
        supportNotifications: true,
        marketingEmails: false,
    });

    const [securityForm, setSecurityForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const tabs: { id: SettingsTab; label: string; icon: any }[] = [
        { id: "profile", label: "Profile", icon: User },
        { id: "wallet", label: "Wallet", icon: Wallet },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
    ];

    const handleNotificationChange = (key: keyof typeof notifications) => {
        setNotifications((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSecurityFormChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setSecurityForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (securityForm.newPassword !== securityForm.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSuccess("Password updated successfully");
            setSecurityForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err: any) {
            setError(err.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotifications = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setSuccess("Notification preferences updated");
        } catch (err: any) {
            setError(err.message || "Failed to update preferences");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-surface rounded-lg shadow">
                    <div className="grid grid-cols-1 md:grid-cols-[240px,1fr]">
                        <div className="border-r border-border">
                            <nav className="flex justify-between md:flex-col overflow-x-auto md:overflow-x-visible px-4 xl:px-2 py-4 space-x-2 md:space-x-0 md:space-y-2">
                                {tabs.map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => setActiveTab(id)}
                                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap md:w-full
                      ${
                          activeTab === id
                              ? "bg-primary-light text-primary"
                              : "text-text-secondary hover:bg-background-alt"
                      }`}>
                                        <Icon className="w-5 h-5 md:mr-3" />
                                        <span className="hidden md:inline">
                                            {label}
                                        </span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="mb-6 p-4 rounded-lg bg-error-light text-error flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 rounded-lg bg-success-light text-success">
                                    {success}
                                </div>
                            )}

                            {activeTab === "profile" && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-text">
                                        Profile Settings
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={user?.email || ""}
                                                disabled
                                                className="mt-1 block w-full px-3 py-2 border border-border rounded-lg bg-background text-text-secondary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                Display Name
                                            </label>
                                            <input
                                                type="text"
                                                defaultValue={
                                                    user?.email?.split("@")[0]
                                                }
                                                className="mt-1 block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-surface text-text"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                Bio
                                            </label>
                                            <textarea
                                                rows={4}
                                                className="mt-1 block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-surface text-text"
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "notifications" && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-text">
                                        Notification Preferences
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between py-3">
                                            <div>
                                                <h3 className="text-text font-medium">
                                                    Campaign Updates
                                                </h3>
                                                <p className="text-sm text-text-secondary">
                                                    Receive updates about
                                                    campaigns you've supported
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        notifications.emailUpdates
                                                    }
                                                    onChange={() =>
                                                        handleNotificationChange(
                                                            "emailUpdates"
                                                        )
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-background-alt peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between py-3 border-t border-border">
                                            <div>
                                                <h3 className="text-text font-medium">
                                                    Campaign Alerts
                                                </h3>
                                                <p className="text-sm text-text-secondary">
                                                    Get notified about new
                                                    campaigns in your interests
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        notifications.campaignAlerts
                                                    }
                                                    onChange={() =>
                                                        handleNotificationChange(
                                                            "campaignAlerts"
                                                        )
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-background-alt peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between py-3 border-t border-border">
                                            <div>
                                                <h3 className="text-text font-medium">
                                                    Support Notifications
                                                </h3>
                                                <p className="text-sm text-text-secondary">
                                                    Notifications when someone
                                                    supports your campaign
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        notifications.supportNotifications
                                                    }
                                                    onChange={() =>
                                                        handleNotificationChange(
                                                            "supportNotifications"
                                                        )
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-background-alt peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between py-3 border-t border-border">
                                            <div>
                                                <h3 className="text-text font-medium">
                                                    Marketing Emails
                                                </h3>
                                                <p className="text-sm text-text-secondary">
                                                    Receive updates about
                                                    BlockFund features and news
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        notifications.marketingEmails
                                                    }
                                                    onChange={() =>
                                                        handleNotificationChange(
                                                            "marketingEmails"
                                                        )
                                                    }
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-background-alt peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={
                                                    handleSaveNotifications
                                                }
                                                disabled={loading}
                                                className="px-4 py-2 text-sm font-medium text-light bg-primary hover:bg-primary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50">
                                                {loading
                                                    ? "Saving..."
                                                    : "Save Preferences"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "security" && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-text">
                                        Security Settings
                                    </h2>

                                    <form
                                        onSubmit={handlePasswordChange}
                                        className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                Current Password
                                            </label>
                                            <div className="mt-1 relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={
                                                        securityForm.currentPassword
                                                    }
                                                    onChange={
                                                        handleSecurityFormChange
                                                    }
                                                    required
                                                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-surface text-text"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                New Password
                                            </label>
                                            <div className="mt-1 relative">
                                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    value={
                                                        securityForm.newPassword
                                                    }
                                                    onChange={
                                                        handleSecurityFormChange
                                                    }
                                                    required
                                                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-surface text-text"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                Confirm New Password
                                            </label>
                                            <div className="mt-1 relative">
                                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={
                                                        securityForm.confirmPassword
                                                    }
                                                    onChange={
                                                        handleSecurityFormChange
                                                    }
                                                    required
                                                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-surface text-text"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-4 py-2 text-sm font-medium text-light bg-primary hover:bg-primary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50">
                                                {loading
                                                    ? "Updating..."
                                                    : "Update Password"}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-8 pt-6 border-t border-border">
                                        <h3 className="text-lg font-medium text-text mb-4">
                                            Two-Factor Authentication
                                        </h3>
                                        <p className="text-text-secondary mb-4">
                                            Add an extra layer of security to
                                            your account by enabling two-factor
                                            authentication.
                                        </p>
                                        <button className="px-4 py-2 text-sm font-medium border-2 border-primary text-primary hover:bg-primary hover:text-light rounded-lg transition-colors">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "wallet" && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-text">
                                        Wallet Connection
                                    </h2>

                                    {walletError && (
                                        <div className="p-4 rounded-lg bg-error-light text-error">
                                            {walletError}
                                        </div>
                                    )}

                                    <div className="bg-background rounded-lg p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-medium text-text truncate">
                                                    MetaMask Wallet
                                                </h3>
                                                {address ? (
                                                    <p className="mt-1 text-sm text-text-secondary flex items-center gap-1 truncate">
                                                        Connected:{" "}
                                                        <span className="text-primary font-semibold">
                                                            {address.slice(
                                                                0,
                                                                6
                                                            )}
                                                            ...
                                                            {address.slice(-4)}
                                                        </span>
                                                    </p>
                                                ) : (
                                                    <p className="mt-1 text-sm text-text-secondary">
                                                        Connect your MetaMask
                                                        wallet to start creating
                                                        campaigns
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={
                                                    address
                                                        ? disconnectWallet
                                                        : connectWallet
                                                }
                                                disabled={walletLoading}
                                                className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                          ${
                              address
                                  ? "text-text bg-background hover:bg-background-alt focus:ring-text"
                                  : "text-light bg-primary hover:bg-primary-dark focus:ring-primary"
                          } disabled:opacity-50`}>
                                                {walletLoading
                                                    ? "Processing..."
                                                    : address
                                                    ? "Disconnect"
                                                    : "Connect Wallet"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
