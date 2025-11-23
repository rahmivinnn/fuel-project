import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

const TermsScreen = () => {
    const navigate = useNavigate();

    const terms = [
        {
            title: "Acceptance of Terms",
            content: "By accessing or using the FuelFriendly service, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use our services."
        },
        {
            title: "Service Description",
            content: "FuelFriendly provides on-demand fuel delivery services. We connect users with nearby fuel stations and delivery partners to facilitate fuel and grocery delivery."
        },
        {
            title: "User Responsibilities",
            content: "Users are responsible for providing accurate information, maintaining account security, and using the service in compliance with applicable laws and regulations."
        },
        {
            title: "Payment Terms",
            content: "Users agree to pay all fees associated with services used. Payments are processed through secure third-party payment processors. All fees are non-refundable unless otherwise specified."
        },
        {
            title: "Limitation of Liability",
            content: "FuelFriendly shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use our services."
        },
        {
            title: "Termination",
            content: "We may terminate or suspend your account and access to services immediately, without prior notice, for any reason whatsoever, including without limitation if you breach the Terms."
        },
        {
            title: "Changes to Terms",
            content: "We reserve the right to modify or replace these Terms at any time. Your continued use of the service after any such changes constitutes your acceptance of the new Terms."
        }
    ];

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="p-4 flex items-center sticky top-0 bg-gray-50 dark:bg-dark-bg z-10">
                <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow -ml-10">Terms and Conditions</h2>
            </header>

            <div className="p-4 pb-20">
                <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-lg mb-2">User Agreement</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="space-y-6">
                    {terms.map((term, index) => (
                        <div key={index} className="bg-light-card dark:bg-dark-card rounded-2xl p-6">
                            <h3 className="font-bold text-lg mb-3">{term.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{term.content}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        By using FuelFriendly services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                    </p>
                </div>
            </div>
        </div>
        </AnimatedPage>
    );
};

export default TermsScreen;