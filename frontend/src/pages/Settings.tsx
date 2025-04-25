import { t } from "@lingui/macro";
import { AlertTriangle, Key, Lock, Shield, User, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";
import { supabase } from "../lib/supabase";

type SettingsTab = "profile" | "security" | "wallet";

export function Settings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const {
        address,
        loading: walletLoading,
        error: walletError,
        connectWallet,
        disconnectWallet,
    } = useWallet();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
        const tab = searchParams.get("tab");
        return (tab as SettingsTab) || "profile";
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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
        if (!user) {
            navigate("/login", {
                state: { from: "/settings", tab: activeTab },
            });
            return;
        }
    }, [user, navigate, activeTab]);

    useEffect(() => {
        setSearchParams({ tab: activeTab });
    }, [activeTab, setSearchParams]);

    useEffect(() => {
        const tab = searchParams.get("tab") as SettingsTab;
        if (tab && ["profile", "security", "wallet"].includes(tab)) {
            setActiveTab(tab);
        } else {
            setActiveTab("profile");
            setSearchParams({ tab: "profile" });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        setError(null);
        setSuccess(null);
    }, [activeTab]);

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
            setError(t`Failed to load profile data`);
        }
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
            setError(t`New passwords do not match`);
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
                throw new Error(t`Current password is incorrect`);
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: securityForm.newPassword,
            });

            if (updateError) throw updateError;

            setSuccess(t`Password updated successfully`);
            setSecurityForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err: any) {
            console.error("Error updating password:", err);
            setError(err.message || t`Failed to update password`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: existingUser, error: checkError } = await supabase
                .from("profiles")
                .select("id")
                .eq("username", profileForm.username)
                .neq("id", user?.id)
                .single();

            if (checkError && checkError.code !== "PGRST116") {
                throw checkError;
            }

            if (existingUser) {
                throw new Error(t`This username is already taken`);
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

            setSuccess(t`Profile updated successfully`);
            setInitialProfileForm(profileForm);
        } catch (err: any) {
            console.error("Error updating profile:", err);
            if (err.message === "This username is already taken") {
                setError(err.message);
            } else {
                setError(t`Failed to update profile`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab: SettingsTab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const handleConnectWallet = async () => {
        try {
            if (address) {
                await disconnectWallet();
            }

            if (window.ethereum && window.ethereum.selectedAddress) {
                try {
                    await window.ethereum.request({
                        method: "wallet_requestPermissions",
                        params: [{ eth_accounts: {} }],
                    });
                } catch (permissionError) {
                    console.error("Permission request error:", permissionError);
                }
            }

            await connectWallet();
        } catch (error) {
            console.error("Wallet connection error:", error);
        }
    };

    const tabs: { id: SettingsTab; label: string; icon: any }[] = [
        { id: "profile", label: t`Profile`, icon: User },
        { id: "wallet", label: t`Wallet`, icon: Wallet },
        { id: "security", label: t`Security`, icon: Shield },
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
                                        onClick={() => handleTabChange(id)}
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
                                        {t`Profile Settings`}
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                {t`Email`}
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
                                                {t`Display Name`}
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
                                                {t`Bio`}
                                            </label>
                                            <textarea
                                                name="bio"
                                                rows={4}
                                                value={profileForm.bio}
                                                onChange={handleProfileChange}
                                                className="mt-1 block w-full px-3 py-2 border border-border rounded-lg focus:ring-primary focus:border-primary bg-surface text-text"
                                                placeholder={t`Tell us about yourself...`}
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
                                                    ? t`Saving...`
                                                    : t`Save Changes`}
                                            </button>
                                        </div>

                                        <div className="border-t border-border mt-6 pt-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-medium text-text">
                                                        {t`View Public Profile`}
                                                    </h3>
                                                    <p className="text-sm text-text-secondary">
                                                        {t`See how others view your profile`}
                                                    </p>
                                                </div>
                                                <Link
                                                    to={`/profile/${user?.id}`}
                                                    className="px-4 py-2 text-sm font-medium text-primary border-2 border-primary hover:bg-primary hover:text-light rounded-lg transition-colors">
                                                    {t`View Profile`}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "security" && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-text">
                                        {t`Security Settings`}
                                    </h2>

                                    <form
                                        onSubmit={handlePasswordChange}
                                        className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text">
                                                {t`Current Password`}
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
                                                {t`New Password`}
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
                                                {t`Confirm New Password`}
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
                                                    ? t`Updating...`
                                                    : t`Update Password`}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === "wallet" && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-text">
                                        {t`Wallet Connection`}
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
                                                    {t`MetaMask Wallet`}
                                                </h3>
                                                {address ? (
                                                    <p className="mt-1 text-sm text-text-secondary flex items-center gap-1 truncate">
                                                        {t`Connected:`}{" "}
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
                                                        {t`Connect your MetaMask wallet to start creating campaigns`}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={
                                                    address
                                                        ? disconnectWallet
                                                        : handleConnectWallet
                                                }
                                                disabled={walletLoading}
                                                className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                          ${
                              address
                                  ? "text-text bg-background hover:bg-background-alt focus:ring-text"
                                  : "text-light bg-primary hover:bg-primary-dark focus:ring-primary"
                          } disabled:opacity-50`}>
                                                {walletLoading
                                                    ? t`Processing...`
                                                    : address
                                                    ? t`Disconnect`
                                                    : t`Connect Wallet`}
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
