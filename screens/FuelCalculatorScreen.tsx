import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Fuel, Calendar, MapPin } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';

const FuelCalculatorScreen = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        distance: '',
        fuelConsumed: '',
        fuelPrice: '15000'
    });
    const [result, setResult] = useState<{
        efficiency: number | null;
        costPerKm: number | null;
        costPerLiter: number | null;
    }>({
        efficiency: null,
        costPerKm: null,
        costPerLiter: null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateEfficiency = () => {
        const distance = parseFloat(formData.distance);
        const fuelConsumed = parseFloat(formData.fuelConsumed);
        const fuelPrice = parseFloat(formData.fuelPrice);

        if (isNaN(distance) || isNaN(fuelConsumed) || isNaN(fuelPrice) || distance <= 0 || fuelConsumed <= 0) {
            alert('Please enter valid numbers for all fields');
            return;
        }

        const efficiency = distance / fuelConsumed; // km per liter
        const costPerLiter = fuelPrice;
        const costPerKm = (fuelPrice * fuelConsumed) / distance;

        setResult({
            efficiency: parseFloat(efficiency.toFixed(2)),
            costPerKm: parseFloat(costPerKm.toFixed(2)),
            costPerLiter: parseFloat(costPerLiter.toFixed(2))
        });
    };

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="p-4 flex items-center sticky top-0 bg-gray-50 dark:bg-dark-bg z-10">
                <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow -ml-10">Fuel Efficiency Calculator</h2>
            </header>

            <div className="p-4">
                <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-lg mb-4">Calculate Your Fuel Efficiency</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        Enter your trip details to calculate fuel efficiency and costs
                    </p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Distance Traveled (km)</label>
                            <input 
                                type="number" 
                                name="distance"
                                value={formData.distance}
                                onChange={handleChange}
                                placeholder="e.g., 100"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Fuel Consumed (liters)</label>
                            <input 
                                type="number" 
                                name="fuelConsumed"
                                value={formData.fuelConsumed}
                                onChange={handleChange}
                                placeholder="e.g., 8"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent"
                            />
                        </div>
                        
                        <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">Fuel Price per Liter (Rp)</label>
                            <input 
                                type="number" 
                                name="fuelPrice"
                                value={formData.fuelPrice}
                                onChange={handleChange}
                                placeholder="e.g., 15000"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent"
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={calculateEfficiency}
                        className="w-full mt-6 bg-primary text-white py-3 rounded-full font-semibold"
                    >
                        Calculate Efficiency
                    </button>
                </div>

                {result.efficiency !== null && (
                    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6">
                        <h3 className="font-bold text-lg mb-4">Results</h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                                <div className="flex items-center">
                                    <Fuel className="text-primary mr-2" size={20} />
                                    <span>Fuel Efficiency</span>
                                </div>
                                <span className="font-bold">{result.efficiency} km/L</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                                <div className="flex items-center">
                                    <MapPin className="text-primary mr-2" size={20} />
                                    <span>Cost per Kilometer</span>
                                </div>
                                <span className="font-bold">Rp {result.costPerKm}</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                                <div className="flex items-center">
                                    <Calendar className="text-primary mr-2" size={20} />
                                    <span>Cost per Liter</span>
                                </div>
                                <span className="font-bold">Rp {result.costPerLiter}</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm">
                                <span className="font-bold">Tip:</span> A fuel efficiency of 15+ km/L is considered good for most vehicles.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </AnimatedPage>
    );
};

export default FuelCalculatorScreen;