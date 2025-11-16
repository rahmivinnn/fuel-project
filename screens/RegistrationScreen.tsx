import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Eye, EyeOff, Plus, ChevronDown } from 'lucide-react';
import { useAppContext } from '../App';
import { apiRegister, apiLoginWithGoogleCredential } from '../services/api';
import { createUserWithEmailAndPassword, auth } from '../firebase';
import carIcon from './Vector.png';
import Logo from '../components/Logo';
import AnimatedPage from '../components/AnimatedPage';

const Stepper = ({ currentStep }: { currentStep: number }) => {
    const steps = [1, 2, 3];
    return (
        <div className="flex items-center justify-center w-full my-8">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                                currentStep > step ? 'bg-primary text-white' : currentStep === step ? 'border-2 border-primary text-primary' : 'border-2 border-gray-300 text-gray-400'
                            }`}
                            style={{ position: 'relative' }}
                        >
                            {currentStep > step ? <Check size={20} /> : step}
                        </div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 border-t border-dashed transition-colors duration-300 ${currentStep > step ? 'border-primary' : 'border-gray-300'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const RegistrationScreen = () => {
    const navigate = useNavigate();
    const { login, updateUser } = useAppContext();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        vehicleBrand: '',
        vehicleColor: '',
        licenseNumber: '',
        fuelType: 'Petrol',
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
        } else {
            navigate(-1);
        }
    };
    
    const createAccount = async () => {
        try {
            const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const idToken = await cred.user.getIdToken(true);
            const userData = await apiLoginWithGoogleCredential(idToken);
            await apiRegister({ ...formData, email: userData.email, fullName: userData.fullName });
            updateUser(userData);
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration failed. Please try again.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1 next={handleNext} formData={formData} handleChange={handleChange} />;
            case 2:
                return <Step2 next={handleNext} formData={formData} handleChange={handleChange} />;
            case 3:
                return <Step3 createAccount={createAccount} editDetails={() => setStep(1)} formData={formData} />;
            default:
                return <Step1 next={handleNext} formData={formData} handleChange={handleChange} />;
        }
    };

    return (
        <AnimatedPage>
        <div className="min-h-screen flex flex-col p-6 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="flex items-center space-x-2 mb-3">
                <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <button onClick={handleBack} className="text-sm">Back</button>
            </header>
            
            <div className="flex flex-col items-center">
                <Logo />
                <h2 className="text-4xl md:text-5xl font-bold text-gray-700 dark:text-gray-200 text-center">Registration</h2>
                <div className="relative w-full max-w-sm pb-6 mb-2">
                    <Stepper currentStep={step} />
                </div>
            </div>

            <div className="flex-grow">
                {renderStep()}
            </div>
        </div>
        </AnimatedPage>
    );
};

interface StepProps {
    next: () => void;
    formData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const Step1 = ({ next, formData, handleChange }: StepProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [countries, setCountries] = useState<{ name: string; code: string; flag: string }[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<{ name: string; code: string; flag: string }>({ name: 'Indonesia', code: '+62', flag: '🇮🇩' });
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [countryQuery, setCountryQuery] = useState('');
    const countryBtnRef = useRef<HTMLButtonElement | null>(null);
    const [countryBtnWidth, setCountryBtnWidth] = useState(0);
    const toFlag = (cc: string) => cc.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
    const loadCountries = async () => {
        if (countries.length > 0 || loadingCountries) return;
        setLoadingCountries(true);
        try {
            const res = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,cca2');
            const data = await res.json();
            const mapped = data
                .map((c: any) => {
                    const root = c?.idd?.root || '';
                    const suf = Array.isArray(c?.idd?.suffixes) && c.idd.suffixes.length ? c.idd.suffixes[0] : '';
                    const dial = `${root}${suf}`;
                    if (!dial) return null;
                    return { name: c?.name?.common || '', code: dial, flag: toFlag(c?.cca2 || '') };
                })
                .filter(Boolean)
                .sort((a: any, b: any) => a.name.localeCompare(b.name));
            setCountries(mapped);
        } catch (e) {
        } finally {
            setLoadingCountries(false);
        }
    };

    useEffect(() => {
        if (countryBtnRef.current) {
            setCountryBtnWidth(countryBtnRef.current.offsetWidth);
        }
    }, [selectedCountry]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        next();
    }
    
    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            <input name="fullName" type="text" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary" required />
            <input name="email" type="email" placeholder="Email address" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary" required />
            <div className="relative rounded-full border border-gray-300 dark:border-gray-600 overflow-hidden">
                <div className="flex items-center">
                    <button ref={countryBtnRef} type="button" onClick={() => { setIsCountryOpen(true); loadCountries(); }} className="px-3 py-3 flex items-center space-x-2">
                        <span>{selectedCountry.flag}</span>
                        <span className="text-gray-700 dark:text-gray-300">{selectedCountry.code}</span>
                        <ChevronDown size={16} className="text-gray-400" />
                    </button>
                    <input 
                        name="phone" 
                        type="tel" 
                        inputMode="tel"
                        placeholder="Phone Number" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        autoComplete="tel"
                        className="flex-1 pr-2 py-3 bg-transparent focus:outline-none" 
                        style={{ paddingLeft: 16 }}
                        required 
                    />
                </div>
                
            </div>
            <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400">
                    {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
            </div>
            <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400">
                    {showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
            </div>
            <button type="submit" className="w-full mt-4 bg-primary text-white py-4 rounded-full text-lg font-semibold ripple">Next</button>
            {isCountryOpen && (
                <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setIsCountryOpen(false)}>
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-card rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="h-1 w-12 bg-gray-300 dark:bg-gray-700 rounded mx-auto mb-3"></div>
                        <div className="mb-3">
                            <input
                                type="text"
                                value={countryQuery}
                                onChange={(e) => setCountryQuery(e.target.value)}
                                placeholder="Search country or code"
                                className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        {loadingCountries && <div className="py-4 text-center">Loading...</div>}
                        {!loadingCountries && countries
                            .filter((c) => {
                                const q = countryQuery.toLowerCase();
                                return !q || c.name.toLowerCase().includes(q) || c.code.includes(countryQuery);
                            })
                            .map((c) => (
                            <button key={`${c.name}-${c.code}`} onClick={() => { setSelectedCountry(c); setIsCountryOpen(false); }} className="w-full flex items-center justify-between py-3">
                                <span className="flex items-center space-x-2">
                                    <span>{c.flag}</span>
                                    <span>{c.name}</span>
                                </span>
                                <span className="text-gray-700 dark:text-gray-300">{c.code}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </form>
    );
};

const Step2 = ({ next, formData, handleChange }: StepProps) => (
    <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-6">
        <input name="vehicleBrand" type="text" placeholder="Vehicle Brand" value={formData.vehicleBrand} onChange={handleChange} className="w-full px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary" required />
        <input name="vehicleColor" type="text" placeholder="Vehicle Color" value={formData.vehicleColor} onChange={handleChange} className="w-full px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary" required />
        <input name="licenseNumber" type="text" placeholder="License Number" value={formData.licenseNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary" required />
        <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
            <option>Petrol</option>
            <option>Diesel</option>
            <option>Electric</option>
        </select>
        <button type="button" className="w-full flex items-center justify-center text-primary border-2 border-primary py-3 rounded-full font-semibold ripple">
            <Plus size={20} className="mr-2" /> Add Vehicle
        </button>
        <button type="submit" className="w-full mt-4 bg-primary text-white py-4 rounded-full text-lg font-semibold ripple">Next</button>
    </form>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="font-medium text-right">{value}</span>
    </div>
);


const Step3 = ({ createAccount, editDetails, formData }: { createAccount: () => void, editDetails: () => void, formData: any }) => (
    <div className="flex flex-col h-full">
        <div className="flex-grow bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-md space-y-2">
            <DetailRow label="Name" value={formData.fullName} />
            <DetailRow label="Email Address" value={formData.email} />
            <DetailRow label="Phone No." value={formData.phone} />
            <DetailRow label="Password" value="**********" />
            <DetailRow label="Vehicle Brand" value={formData.vehicleBrand} />
            <DetailRow label="Vehicle Color" value={formData.vehicleColor} />
            <DetailRow label="License Number" value={formData.licenseNumber} />
            <DetailRow label="Fuel Type" value={formData.fuelType} />
        </div>
        <div className="mt-8 space-y-4">
            <button onClick={createAccount} className="w-full bg-primary text-white py-4 rounded-full text-lg font-semibold ripple">Create Account</button>
            <button onClick={editDetails} className="w-full text-primary py-4 rounded-full text-lg font-semibold ripple">Edit Details</button>
        </div>
    </div>
);


export default RegistrationScreen;
