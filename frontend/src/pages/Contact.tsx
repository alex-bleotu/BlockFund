import { ArrowRight, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

export function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSuccess(true);
        setLoading(false);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSuccess(false), 5000);
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
                    {/* Contact Information */}
                    <div className="lg:col-span-2 space-y-8 mt-10 md:mt-0">
                        <div>
                            <h2 className="text-3xl font-bold text-text mb-8">
                                Get in Touch
                            </h2>
                            <p className="text-text-secondary mb-12 text-lg">
                                Our support team is spread across the globe to
                                give you the best possible experience.
                            </p>
                        </div>

                        <div className="space-y-8 px-2">
                            <div className="flex items-start space-x-6 group">
                                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                                    <Mail className="w-7 h-7 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-text mb-2">
                                        Email Us
                                    </h3>
                                    <p className="text-text-secondary hover:text-primary transition-colors">
                                        <a href="mailto:support@blockfund.com">
                                            support@blockfund.com
                                        </a>
                                    </p>
                                    <p className="text-text-secondary hover:text-primary transition-colors">
                                        <a href="mailto:info@blockfund.com">
                                            info@blockfund.com
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
                                        Call Us
                                    </h3>
                                    <p className="text-text-secondary">
                                        +1 (555) 123-4567
                                    </p>
                                    <p className="text-sm text-text-secondary mt-1">
                                        Available Mon-Fri, 9am-6pm EST
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-6 group">
                                <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                                    <MapPin className="w-7 h-7 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-text mb-2">
                                        Visit Us
                                    </h3>
                                    <p className="text-text-secondary">
                                        123 Blockchain Street
                                    </p>
                                    <p className="text-text-secondary">
                                        New York, NY 10001
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-12 p-6 bg-surface rounded-2xl shadow-lg">
                            <h3 className="text-lg font-semibold text-text mb-2">
                                Quick Response Time
                            </h3>
                            <p className="text-text-secondary">
                                We typically respond within 2-3 business hours
                                during our working hours.
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-surface rounded-2xl shadow-lg p-8 md:p-12">
                            <div className="max-w-2xl">
                                <h2 className="text-2xl font-bold text-text mb-2">
                                    Send us a Message
                                </h2>
                                <p className="text-text-secondary mb-8">
                                    Fill out the form below and we'll get back
                                    to you as soon as possible.
                                </p>

                                {success && (
                                    <div className="mb-6 p-4 bg-success-light text-success rounded-lg flex items-center">
                                        <ArrowRight className="w-5 h-5 mr-2" />
                                        Message sent successfully! We'll be in
                                        touch soon.
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="block text-sm font-medium text-text mb-2">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text placeholder-text-secondary/60 transition-colors"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-medium text-text mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text placeholder-text-secondary/60 transition-colors"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="subject"
                                            className="block text-sm font-medium text-text mb-2">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text placeholder-text-secondary/60 transition-colors"
                                            placeholder="How can we help?"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="message"
                                            className="block text-sm font-medium text-text mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text placeholder-text-secondary/60 transition-colors resize-none"
                                            placeholder="Tell us more about your inquiry..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center px-8 py-4 text-light font-medium bg-primary hover:bg-primary-dark rounded-xl transition-colors duration-200 disabled:opacity-50 group">
                                        {loading ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                Send Message
                                                <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
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
