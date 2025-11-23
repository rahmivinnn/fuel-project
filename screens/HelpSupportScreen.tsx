import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MessageCircle, HelpCircle, FileText, Shield } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

const HelpSupportScreen = () => {
    const navigate = useNavigate();

    const supportOptions = [
        {
            icon: <Mail size={24} />,
            title: 'Email Support',
            description: 'Send us an email for detailed inquiries',
            action: 'support@fuelfriendly.com'
        },
        {
            icon: <Phone size={24} />,
            title: 'Call Us',
            description: 'Speak with our support team directly',
            action: '+62 812 3456 7890'
        },
        {
            icon: <MessageCircle size={24} />,
            title: 'Live Chat',
            description: 'Get instant help through live chat',
            action: 'Available 24/7'
        }
    ];

    const faqs = [
        {
            question: 'How do I place an order?',
            answer: 'To place an order, go to the Home screen, select a nearby fuel station, choose your fuel type and quantity, add any groceries if needed, and proceed to checkout.'
        },
        {
            question: 'How long does delivery take?',
            answer: 'Delivery typically takes 15-30 minutes depending on your location and traffic conditions.'
        },
        {
            question: 'What payment methods are accepted?',
            answer: 'We accept all major credit/debit cards, bank transfers, and digital wallets like OVO, GoPay, and Dana.'
        },
        {
            question: 'Can I cancel my order?',
            answer: 'You can cancel your order before the FuelFriend starts delivery. Once delivery has begun, cancellation may incur a fee.'
        }
    ];

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="p-4 flex items-center sticky top-0 bg-gray-50 dark:bg-dark-bg z-10">
                <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow -ml-10">Help and Support</h2>
            </header>

            <div className="p-4">
                <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-lg mb-2">How can we help you?</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        We're here to assist you with any questions or issues
                    </p>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-lg mb-4 px-2">Contact Support</h3>
                    <div className="space-y-4">
                        {supportOptions.map((option, index) => (
                            <div key={index} className="flex items-center p-4 bg-light-card dark:bg-dark-card rounded-2xl">
                                <div className="p-3 rounded-full bg-primary/10 text-primary mr-4">
                                    {option.icon}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold">{option.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                                </div>
                                <div className="text-primary font-semibold text-sm">{option.action}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-lg mb-4 px-2">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-light-card dark:bg-dark-card rounded-2xl p-4">
                                <p className="font-semibold mb-2">{faq.question}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div 
                        onClick={() => navigate('/terms')}
                        className="flex items-center justify-between p-4 bg-light-card dark:bg-dark-card rounded-2xl cursor-pointer"
                    >
                        <div className="flex items-center">
                            <FileText className="text-primary mr-4" size={24} />
                            <span className="font-semibold">Terms and Conditions</span>
                        </div>
                    </div>
                    
                    <div 
                        onClick={() => navigate('/privacy')}
                        className="flex items-center justify-between p-4 bg-light-card dark:bg-dark-card rounded-2xl cursor-pointer"
                    >
                        <div className="flex items-center">
                            <Shield className="text-primary mr-4" size={24} />
                            <span className="font-semibold">Privacy Policy</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </AnimatedPage>
    );
};

export default HelpSupportScreen;