import { t } from "@lingui/core/macro";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../hooks/useAuth";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn } = useAuth();

    const searchParams = new URLSearchParams(location.search);
    const redirectTo = searchParams.get("redirect") || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError("");
            setLoading(true);
            await signIn(email, password);
            navigate(redirectTo);
        } catch (err: any) {
            setError(t`Invalid email or password. Please try again.`);
            console.error("Login error:", err);
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
                        {t`Welcome back`}
                    </h2>
                    <p className="mt-2 text-center text-sm text-text-secondary">
                        {t`Or`}{" "}
                        <Link
                            to="/register"
                            className="font-medium text-primary hover:text-primary-dark">
                            {t`start your journey today`}
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
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full pl-10 pr-10 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text"
                                    placeholder={t`Enter your password`}
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

                        {/* <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <a
                                    href="#"
                                    className="font-medium text-primary hover:text-primary-dark">
                                    {t`Forgot password?`}
                                </a>
                            </div>
                        </div> */}

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-light bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}>
                            {loading ? t`Signing in...` : t`Sign in`}
                        </button>
                    </form>
                </div>
            </div>

            <div className="hidden lg:block relative flex-1">
                <div className="absolute inset-0">
                    <img
                        className="h-full w-full object-cover"
                        src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80"
                        alt={t`Technology background`}
                    />
                    <div className="absolute inset-0 bg-primary mix-blend-multiply opacity-20"></div>
                </div>
            </div>
        </div>
    );
}
