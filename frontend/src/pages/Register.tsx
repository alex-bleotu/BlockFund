import { t } from "@lingui/core/macro";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

export function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUsername(value);

        if (value.includes(" ")) {
            setUsernameError(t`Username cannot contain spaces`);
        } else {
            setUsernameError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (username.includes(" ")) {
            setUsernameError(t`Username cannot contain spaces`);
            return;
        }

        try {
            setError("");
            setLoading(true);

            await signUp(email, password);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { error: profileError } = await supabase
                    .from("profiles")
                    .upsert({
                        id: user.id,
                        username: username,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });

                if (profileError) throw profileError;
            }

            navigate("/");
        } catch (err) {
            setError(t`Failed to create an account. Please try again.`);
            console.error("Registration error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex -mt-12 sm:mt-0">
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative">
                <div className="absolute top-4 right-4">
                    <ThemeToggle />
                </div>
                <div className="mx-auto w-full max-w-sm">
                    <Logo />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-text">
                        {t`Create your account`}
                    </h2>
                    <p className="mt-2 text-center text-sm text-text-secondary">
                        {t`Already have an account?`}{" "}
                        <Link
                            to="/login"
                            className="font-medium text-primary hover:text-primary-dark">
                            {t`Sign in`}
                        </Link>
                    </p>
                </div>

                <div className="mt-8 mx-auto w-full max-w-sm">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-error-light text-error text-sm">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-text">
                                {t`Username`}
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-text-tertiary" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                                        usernameError
                                            ? "border-error"
                                            : "border-border"
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text`}
                                    placeholder={t`Choose a username`}
                                    value={username}
                                    onChange={handleUsernameChange}
                                    disabled={loading}
                                />
                            </div>
                            {usernameError && (
                                <p className="mt-1 text-sm text-error">
                                    {usernameError}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-text">
                                {t`Email address`}
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-text-tertiary" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                    placeholder={t`Enter your email`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-text">
                                {t`Password`}
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-text-tertiary" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none block w-full pl-10 pr-10 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                    placeholder={t`Create a password`}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary hover:text-text transition-colors"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }>
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                    <span className="sr-only">
                                        {showPassword
                                            ? t`Hide password`
                                            : t`Show password`}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-light bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}>
                            {loading
                                ? t`Creating account...`
                                : t`Create Account`}
                        </button>
                    </form>
                </div>
            </div>

            <div className="hidden lg:block relative flex-1">
                <div className="absolute inset-0">
                    <img
                        className="h-full w-full object-cover"
                        src="https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&q=80"
                        alt={t`Blockchain visualization`}
                    />
                    <div className="absolute inset-0 bg-primary mix-blend-multiply opacity-20"></div>
                </div>
            </div>
        </div>
    );
}
