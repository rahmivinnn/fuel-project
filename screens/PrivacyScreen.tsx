import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

const PrivacyScreen = () => {
    const navigate = useNavigate();

    const privacySections = [
        {
            title: "Information We Collect",
            content: "We collect information you provide directly to us, including your name, email address, phone number, vehicle information, and payment details. We also collect location data to provide our services and improve your experience."
        },
        {
            title: "How We Use Your Information",
            content: "We use your information to provide, maintain, and improve our services, process transactions, communicate with you, and personalize your experience. We may also use your information for research and analytics purposes."
        },
        {
            title: "Information Sharing",
            content: "We do not sell or rent your personal information to third parties. We may share information with service providers who assist us in operating our services, with your consent, or as required by law."
        },
        {
            title: "Data Security",
            content: "We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security."
        },
        {
            title: "Your Rights",
            content: "You have the right to access, update, or delete your personal information. You may also opt out of certain communications and control how your information is used in our services."
        },
        {
            title: "Data Retention",
            content: "We retain your information for as long as necessary to provide our services and comply with legal obligations. When data is no longer needed, we securely delete it."
        },
        {
            title: "Children's Privacy",
            content: "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18."
        },
        {
            title: "Changes to Privacy Policy",
            content: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'Last updated' date."
        }
    ];

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="p-4 flex items-center sticky top-0 bg-gray-50 dark:bg-dark-bg z-10">
                <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow -ml-10">Privacy Policy</h2>
            </header>

            <div className="p-4 pb-20">
                <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-lg mb-2">Privacy Commitment</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>

                <div className="space-y-6">
                    {privacySections.map((section, index) => (
                        <div key={index} className="bg-light-card dark:bg-dark-card rounded-2xl p-6">
                            <h3 className="font-bold text-lg mb-3">{section.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{section.content}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        If you have any questions about our Privacy Policy, please contact us at privacy@fuelfriendly.com
                    </p>
                </div>
            </div>
        </div>
        </AnimatedPage>
    );
};

export default PrivacyScreen;