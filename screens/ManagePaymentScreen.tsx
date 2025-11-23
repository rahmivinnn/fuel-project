import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, Trash2 } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

const ManagePaymentScreen = () => {
    const navigate = useNavigate();
    const [paymentMethods, setPaymentMethods] = useState([
        {
            id: '1',
            type: 'Credit Card',
            name: 'Visa ending in 1234',
            expiry: '12/25',
            isDefault: true
        },
        {
            id: '2',
            type: 'Digital Wallet',
            name: 'GoPay',
            expiry: '',
            isDefault: false
        }
    ]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCard, setNewCard] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    const handleDelete = (id: string) => {
        if (paymentMethods.find(pm => pm.id === id)?.isDefault) {
            alert('Cannot delete default payment method');
            return;
        }
        setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    };

    const handleSetDefault = (id: string) => {
        setPaymentMethods(paymentMethods.map(pm => ({
            ...pm,
            isDefault: pm.id === id
        })));
    };

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call an API to add the card
        const newMethod = {
            id: `${Date.now()}`,
            type: 'Credit Card',
            name: `Card ending in ${newCard.number.slice(-4)}`,
            expiry: newCard.expiry,
            isDefault: paymentMethods.length === 0
        };
        setPaymentMethods([...paymentMethods, newMethod]);
        setNewCard({ number: '', name: '', expiry: '', cvv: '' });
        setShowAddForm(false);
    };

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="p-4 flex items-center sticky top-0 bg-gray-50 dark:bg-dark-bg z-10">
                <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow -ml-10">Payment Methods</h2>
            </header>

            <div className="p-4">
                <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-lg mb-2">Your Payment Methods</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Manage your payment options for faster checkout
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    {paymentMethods.map((method) => (
                        <div key={method.id} className="bg-light-card dark:bg-dark-card rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-primary/10 text-primary mr-4">
                                        <CreditCard size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{method.name}</p>
                                        {method.expiry && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Expires {method.expiry}</p>
                                        )}
                                    </div>
                                </div>
                                {method.isDefault ? (
                                    <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full">Default</span>
                                ) : (
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => handleSetDefault(method.id)}
                                            className="text-sm text-primary font-semibold"
                                        >
                                            Set Default
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(method.id)}
                                            className="text-gray-500 dark:text-gray-400"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {showAddForm ? (
                    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-4">Add New Card</h3>
                        <form onSubmit={handleAddCard}>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Card Number</label>
                                    <input 
                                        type="text"
                                        value={newCard.number}
                                        onChange={(e) => setNewCard({...newCard, number: e.target.value})}
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Cardholder Name</label>
                                    <input 
                                        type="text"
                                        value={newCard.name}
                                        onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                                        placeholder="Full name"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent"
                                        required
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Expiry Date</label>
                                        <input 
                                            type="text"
                                            value={newCard.expiry}
                                            onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                                            placeholder="MM/YY"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">CVV</label>
                                        <input 
                                            type="text"
                                            value={newCard.cvv}
                                            onChange={(e) => setNewCard({...newCard, cvv: e.target.value})}
                                            placeholder="123"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex space-x-3 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-full font-semibold"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-primary text-white py-3 rounded-full font-semibold"
                                >
                                    Add Card
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="w-full flex items-center justify-center py-4 bg-light-card dark:bg-dark-card border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl font-semibold"
                    >
                        <Plus size={24} className="mr-2" />
                        Add Payment Method
                    </button>
                )}

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <h4 className="font-bold mb-2">Secure Payment</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Your payment information is encrypted and securely stored. We do not store your CVV number.
                    </p>
                </div>
            </div>
        </div>
        </AnimatedPage>
    );
};

export default ManagePaymentScreen;