import { ethers } from "ethers";
import {
    AlertTriangle,
    Bell,
    Key,
    Lock,
    Shield,
    User,
    Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";
import { supabase } from "../lib/supabase";

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

    const [profileForm, setProfileForm] = useState({
        username: "",
        bio: "",
    });

    const [initialProfileForm, setInitialProfileForm] = useState({
        username: "",
        bio: "",
    });

    const isProfileFormChanged =
        profileForm.username !== initialProfileForm.username ||
        profileForm.bio !== initialProfileForm.bio;

    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccess(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    useEffect(() => {
        if (user) {
            loadProfileData();
        }
    }, [user]);

    const loadProfileData = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("username, bio")
                .eq("id", user?.id)
                .single();

            if (error) throw error;

            if (data) {
                const formData = {
                    username: data.username || "",
                    bio: data.bio || "",
                };
                setProfileForm(formData);
                setInitialProfileForm(formData);
            }
        } catch (err) {
            console.error("Error loading profile:", err);
            setError("Failed to load profile data");
        }
    };

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

    const handleProfileChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setProfileForm((prev) => ({
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
            const { error: signInError } =
                await supabase.auth.signInWithPassword({
                    email: user?.email || "",
                    password: securityForm.currentPassword,
                });

            if (signInError) {
                throw new Error("Current password is incorrect");
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: securityForm.newPassword,
            });

            if (updateError) throw updateError;

            setSuccess("Password updated successfully");
            setSecurityForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err: any) {
            console.error("Error updating password:", err);
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

    const handleSaveProfile = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // First check if username is already taken (excluding current user)
            const { data: existingUser, error: checkError } = await supabase
                .from("profiles")
                .select("id")
                .eq("username", profileForm.username)
                .neq("id", user?.id)
                .single();

            if (checkError && checkError.code !== "PGRST116") {
                // PGRST116 means no rows returned
                throw checkError;
            }

            if (existingUser) {
                throw new Error("This username is already taken");
            }

            const { error } = await supabase
                .from("profiles")
                .update({
                    username: profileForm.username,
                    bio: profileForm.bio,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user?.id);

            if (error) throw error;

            setSuccess("Profile updated successfully");
            setInitialProfileForm(profileForm); // Update initial form state
        } catch (err: any) {
            console.error("Error updating profile:", err);
            if (err.message === "This username is already taken") {
                setError(err.message);
            } else {
                setError("Failed to update profile");
            }
        } finally {
            setLoading(false);
        }
    };

    const checkMetaMaskStatus = async () => {
        if (typeof window.ethereum === "undefined") {
            toast.error(
                "MetaMask is not installed. Please install MetaMask to use wallet features.",
                {
                    duration: 5000,
                    position: "bottom-right",
                    icon: "🦊",
                }
            );
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();

            if (accounts.length === 0) {
                toast.error("MetaMask is locked. Please unlock your wallet.", {
                    duration: 5000,
                    position: "bottom-right",
                    icon: "🔒",
                });
            } else {
                toast.success("MetaMask is ready to use", {
                    duration: 3000,
                    position: "bottom-right",
                    icon: "✅",
                });
            }
        } catch (error) {
            toast.error(
                "Error connecting to MetaMask. Please check your wallet.",
                {
                    duration: 5000,
                    position: "bottom-right",
                    icon: "⚠️",
                }
            );
        }
    };

    const tabs: { id: SettingsTab; label: string; icon: any }[] = [
        { id: "profile", label: "Profile", icon: User },
        { id: "wallet", label: "Wallet", icon: Wallet },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
    ];

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
                                                name="username"
                                                value={profileForm.username}
                                                onChange={handleProfileChange}
                                                className="mt-1 block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-surface text-text"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                Bio
                                            </label>
                                            <textarea
                                                name="bio"
                                                rows={4}
                                                value={profileForm.bio}
                                                onChange={handleProfileChange}
                                                className="mt-1 block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-surface text-text"
                                                placeholder="Tell us about yourself..."
                                            />
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={
                                                    loading ||
                                                    !isProfileFormChanged
                                                }
                                                className="px-4 py-2 text-sm font-medium text-light bg-primary hover:bg-primary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50">
                                                {loading
                                                    ? "Saving..."
                                                    : "Save Changes"}
                                            </button>
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
