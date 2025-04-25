import { t } from "@lingui/macro";
import { motion } from "framer-motion";
import { AlertTriangle, HelpCircle } from "lucide-react";

export function FAQs() {
    const faqs = [
        {
            question: t`Is this a real crowdfunding platform?`,
            answer: t`No, BlockFund is not a real crowdfunding platform. This is a school project created for educational purposes only. No real transactions or fundraising activities take place on this platform.`,
            important: true,
        },
        {
            question: t`Can I actually donate to campaigns?`,
            answer: t`Yes, while the campaigns themselves are fictional, the donation flow is live. When you donate, real cryptocurrency is sent from your connected wallet to the campaign's specified address. Use testnet funds only, as this remains a demo environment.`,
        },
        {
            question: t`What is the purpose of this project?`,
            answer: t`This project was created as an educational exercise to demonstrate the potential of blockchain technology in crowdfunding. It showcases the integration of Web3 technologies, smart contracts, and modern web development practices.`,
        },
        {
            question: t`Are the campaigns real?`,
            answer: t`No, all campaigns on this platform are fictional and created for demonstration purposes. They do not represent real fundraising initiatives.`,
        },
        {
            question: t`Can I use this for real crowdfunding?`,
            answer: t`No, this platform should not be used for real crowdfunding purposes. It is a prototype designed for educational demonstration only. For real crowdfunding, please use established platforms like Kickstarter, GoFundMe, or other legitimate services.`,
        },
        {
            question: t`What technologies were used?`,
            answer: t`This project was built using React, TypeScript, Tailwind CSS, Supabase, and Ethereum smart contracts. It demonstrates the integration of blockchain technology with modern web development practices.`,
        },
    ];

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-text mb-4">
                        {t`Frequently Asked Questions`}
                    </h1>
                    <p className="text-text-secondary text-lg">
                        {t`Important information about this project`}
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface p-6 rounded-xl shadow-lg mb-8">
                    <div className="flex items-start space-x-4 p-4 bg-warning-light rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                        <div>
                            <h2 className="text-lg font-semibold text-text mb-2">
                                {t`Educational Project Disclaimer`}
                            </h2>
                            <p className="text-text-secondary">
                                {t`This website is a school project and is not intended for real use. No actual transactions occur, and no real money or cryptocurrency is involved. All features, campaigns, and functionalities are simulated for educational purposes only.`}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-surface p-6 rounded-xl shadow-lg ${
                                faq.important ? "border-2 border-warning" : ""
                            }`}>
                            <h3 className="text-xl font-semibold text-text mb-3">
                                {faq.question}
                            </h3>
                            <p className="text-text-secondary">{faq.answer}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
