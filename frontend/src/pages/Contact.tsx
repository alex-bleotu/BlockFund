import emailjs from "@emailjs/browser";
import { t } from "@lingui/core/macro";
import {
    AlertTriangle,
    ArrowRight,
    Mail,
    MapPin,
    Phone,
    Send,
} from "lucide-react";
import { useRef, useState } from "react";

export function Contact() {
    const formRef = useRef<HTMLFormElement>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formRef.current) return;

        setLoading(true);
        setSuccess(false);
        setError(false);

        emailjs
            .send(
                "gmail",
                "template",
                {
                    user_name: formData.name,
                    user_email: formData.email,
                    message: `Subject: ${formData.subject}\n\nMessage:\n${formData.message}`,
                },
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            )
            .then(
                () => {
                    setLoading(false);
                    setSuccess(true);
                    setFormData({
                        name: "",
                        email: "",
                        subject: "",
                        message: "",
                    });
                    setTimeout(() => setSuccess(false), 5000);
                },
                (error) => {
                    console.error("EmailJS Error:", error);
                    setLoading(false);
                    setError(true);
                    setTimeout(() => setError(false), 5000);
                }
            );
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:pb-24 md:pt-28">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                    <div className="lg:col-span-2 space-y-8 mt-10 md:mt-0">
                        <div>
                            <h2 className="text-3xl font-bold text-text mb-8">
                                {t`Get in Touch`}
                            </h2>
                            <p className="text-text-secondary mb-12 text-lg">
                                {t`Our support team is spread across the globe to give you the best possible experience.`}
                            </p>
                        </div>

                        <div className="space-y-8 px-2">
                            <div className="flex items-start space-x-6 group">
                                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                                    <Mail className="w-7 h-7 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-text mb-2">
                                        {t`Email Us`}
                                    </h3>
                                    <p className="text-text-secondary hover:text-primary transition-colors">
                                        <a href="mailto:alexbleotu2006@gmail.com">
                                            alexbleotu2006@gmail.com
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-6 group">
                                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                                    <Phone className="w-7 h-7 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-text mb-2">
                                        {t`Call Us`}
                                    </h3>
                                    <p className="text-text-secondary">
                                        +40 756 775 906
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-6 group">
                                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                                    <MapPin className="w-7 h-7 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-text mb-2">
                                        {t`Visit Us`}
                                    </h3>
                                    <p className="text-text-secondary">
                                        {t`Don't actually do that!`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-surface rounded-2xl shadow-lg">
                            <h3 className="text-lg font-semibold text-text mb-2">
                                {t`Quick Response Time`}
                            </h3>
                            <p className="text-text-secondary">
                                {t`We typically respond within 2-3 business hours during our working hours.`}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-surface rounded-2xl shadow-lg p-8 md:p-12">
                            <div className="max-w-2xl">
                                <h2 className="text-2xl font-bold text-text mb-2">
                                    {t`Send us a Message`}
                                </h2>
                                <p className="text-text-secondary mb-8">
                                    {t`Fill out the form below and we'll get back to you as soon as possible.`}
                                </p>

                                {success && (
                                    <div className="mb-6 p-4 bg-success-light text-success rounded-lg flex items-center">
                                        <ArrowRight className="w-5 h-5 mr-2" />
                                        {t`Message sent successfully! We'll be in touch soon.`}
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-6 p-4 bg-error/10 text-error rounded-lg flex items-center">
                                        <AlertTriangle className="w-5 h-5 mr-2" />
                                        {t`Failed to send message. Please try again later.`}
                                    </div>
                                )}

                                <form
                                    ref={formRef}
                                    onSubmit={handleSubmit}
                                    className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="block text-sm font-medium text-text mb-2">
                                                {t`Name`}
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text placeholder-text-secondary/60 transition-colors"
                                                placeholder={t`John Doe`}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-medium text-text mb-2">
                                                {t`Email`}
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text placeholder-text-secondary/60 transition-colors"
                                                placeholder={t`john@example.com`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="subject"
                                            className="block text-sm font-medium text-text mb-2">
                                            {t`Subject`}
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text placeholder-text-secondary/60 transition-colors"
                                            placeholder={t`How can we help?`}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="message"
                                            className="block text-sm font-medium text-text mb-2">
                                            {t`Message`}
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text placeholder-text-secondary/60 transition-colors resize-none"
                                            placeholder={t`Tell us more about your inquiry...`}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-light bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-light border-t-transparent rounded-full animate-spin mr-3"></div>
                                                {t`Sending...`}
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2" />
                                                {t`Send Message`}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
