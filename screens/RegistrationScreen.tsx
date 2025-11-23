import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Eye, EyeOff, Plus, ChevronDown, Car } from 'lucide-react';
import { useAppContext } from '../App';
import { apiRegister, apiLoginWithGoogleCredential } from '../services/api';
import { createUserWithEmailAndPassword, auth } from '../firebase';
import Logo from '../components/Logo';
import AnimatedPage from '../components/AnimatedPage';

const Stepper = ({ currentStep }: { currentStep: number }) => {
    const steps = [
        { number: 1, label: 'Account' },
        { number: 2, label: 'Vehicle' },
        { number: 3, label: 'Review' }
    ];
    
    return (
        <div className="flex items-center justify-between w-full my-6 relative px-4">
            {/* Progress line */}
            <div className="absolute top-5 left-4 right-4 h-0.5 bg-gray-300 dark:bg-gray-700 z-0"></div>
            <div 
                className="absolute top-5 left-4 h-0.5 bg-primary z-0 transition-all duration-500 ease-in-out"
                style={{ width: `${(currentStep - 1) * 50}%` }}
            ></div>
            
            {/* Car icon that moves along the progress line */}
            <div 
                className="absolute top-5 transition-all duration-500 ease-in-out z-10"
                style={{ 
                    left: `${(currentStep - 1) * 50}%`,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <div className="relative">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Car size={16} className="text-white" />
                    </div>
                </div>
            </div>
            
            {steps.map((step, index) => (
                <div key={step.number} className="flex flex-col items-center relative z-20">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                            currentStep > step.number 
                                ? 'bg-primary text-white' 
                                : currentStep === step.number 
                                    ? 'border-2 border-primary text-primary bg-white dark:bg-dark-bg' 
                                    : 'border-2 border-gray-300 text-gray-400 bg-white dark:bg-dark-bg'
                        }`}
                    >
                        {currentStep > step.number ? <Check size={20} /> : step.number}
                    </div>
                    <div className={`mt-2 text-xs font-medium ${
                        currentStep === step.number 
                            ? 'text-primary' 
                            : currentStep > step.number 
                                ? 'text-primary' 
                                : 'text-gray-500 dark:text-gray-400'
                    }`}>
                        {step.label}
                    </div>
                </div>
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
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
        } else {
            navigate(-1);
        }
    };
    
    const createAccount = async () => {
        setIsCreatingAccount(true);
        try {
            // First, create the user with email and password
            const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            
            // Get the ID token for the newly created user
            const idToken = await cred.user.getIdToken(true);
            
            // Login with the Google credential (this might be misnamed in the original code)
            // This is actually just using the Firebase ID token to authenticate with your backend
            const userData = await apiLoginWithGoogleCredential(idToken);
            
            // Register the user profile with additional data
            const registeredUser = await apiRegister({ 
                ...formData, 
                email: userData.email, 
                fullName: userData.fullName,
                city: userData.city || ''
            });
            
            // Update the app context with the registered user
            updateUser(registeredUser);
            
            // Navigate to home screen after successful registration
            navigate('/home');
        } catch (error: any) {
            console.error("Registration failed:", error);
            let errorMessage = "Registration failed. Please try again.";
            
            // Provide more specific error messages
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already registered. Please use a different email or log in instead.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Please enter a valid email address.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password should be at least 6 characters.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(errorMessage);
        } finally {
            setIsCreatingAccount(false);
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
                return <Step3 createAccount={createAccount} editDetails={() => setStep(1)} formData={formData} isCreatingAccount={isCreatingAccount} />;
            default:
                return <Step1 next={handleNext} formData={formData} handleChange={handleChange} />;
        }
    };

    return (
        <AnimatedPage>
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-6 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text space-y-4">
            <div className="flex items-center justify-between w-full max-w-sm mb-4">
                <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-700 dark:text-gray-200 text-center flex-1">Registration</h2>
                <div className="w-10"></div> {/* Spacer for alignment */}
            </div>
            
            <div className="w-full max-w-sm">
                <Stepper currentStep={step} />
            </div>

            <div className="w-full max-w-sm flex-grow">
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
        <form onSubmit={handleFormSubmit} className="space-y-3">
            <input name="fullName" type="text" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm" required />
            <input name="email" type="email" placeholder="Email address" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm" required />
            <div className="relative rounded-full border border-gray-300 dark:border-gray-600 overflow-hidden">
                <div className="flex items-center">
                    <button ref={countryBtnRef} type="button" onClick={() => { setIsCountryOpen(true); loadCountries(); }} className="px-3 py-2 flex items-center space-x-2 text-sm mobile-text-sm">
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
                        className="flex-1 pr-2 py-2 bg-transparent focus:outline-none text-sm mobile-text-sm" 
                        style={{ paddingLeft: 12 }}
                        required 
                    />
                </div>
                
            </div>
            <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
            </div>
            <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">
                    {showConfirmPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
            </div>
            <button type="submit" className="w-full mt-4 bg-primary text-white py-2.5 rounded-full text-base font-semibold shadow-lg transition-all active:scale-95 hover:shadow-xl flex items-center justify-center mobile-btn-md ripple">Next</button>
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
                                className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm"
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
                                    <span className="text-sm mobile-text-sm">{c.name}</span>
                                </span>
                                <span className="text-gray-700 dark:text-gray-300 text-sm mobile-text-sm">{c.code}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </form>
    );
};

const Step2 = ({ next, formData, handleChange }: StepProps) => {
    // Add a state to track if vehicle is added
    const [vehicleAdded, setVehicleAdded] = useState(false);
    
    // Function to handle adding vehicle
    const handleAddVehicle = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        // Check if all vehicle fields are filled
        if (formData.vehicleBrand && formData.vehicleColor && formData.licenseNumber && formData.fuelType) {
            setVehicleAdded(true);
            // Show confirmation or proceed to next step
            alert('Vehicle added successfully!');
        } else {
            alert('Please fill in all vehicle details before adding.');
        }
    };
    
    return (
        <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-3">
            <input name="vehicleBrand" type="text" placeholder="Vehicle Brand" value={formData.vehicleBrand} onChange={handleChange} className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm" required />
            <input name="vehicleColor" type="text" placeholder="Vehicle Color" value={formData.vehicleColor} onChange={handleChange} className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm" required />
            <input name="licenseNumber" type="text" placeholder="License Number" value={formData.licenseNumber} onChange={handleChange} className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm" required />
            <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm mobile-text-sm appearance-none">
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Electric</option>
            </select>
            <button 
                type="button" 
                onClick={handleAddVehicle}
                className={`w-full flex items-center justify-center ${vehicleAdded ? 'bg-primary text-white' : 'text-primary border-2 border-primary'} py-2.5 rounded-full text-base font-semibold transition-all active:scale-95 hover:shadow-md mobile-btn-md ripple`}
            >
                <Plus size={20} className="mr-2" /> 
                {vehicleAdded ? 'Vehicle Added' : 'Add Vehicle'}
            </button>
            <button type="submit" className="w-full mt-4 bg-primary text-white py-2.5 rounded-full text-base font-semibold shadow-lg transition-all active:scale-95 hover:shadow-xl flex items-center justify-center mobile-btn-md ripple">Next</button>
        </form>
    );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-gray-500 dark:text-gray-400 text-sm mobile-text-sm">{label}</span>
        <span className="font-medium text-right text-sm mobile-text-sm">{value}</span>
    </div>
);


const Step3 = ({ createAccount, editDetails, formData, isCreatingAccount }: { createAccount: () => void, editDetails: () => void, formData: any, isCreatingAccount: boolean }) => (
    <div className="flex flex-col h-full">
        <div className="flex-grow bg-light-card dark:bg-dark-card p-4 rounded-2xl shadow-md space-y-2">
            <DetailRow label="Name" value={formData.fullName} />
            <DetailRow label="Email Address" value={formData.email} />
            <DetailRow label="Phone No." value={formData.phone} />
            <DetailRow label="Password" value="**********" />
            <DetailRow label="Vehicle Brand" value={formData.vehicleBrand} />
            <DetailRow label="Vehicle Color" value={formData.vehicleColor} />
            <DetailRow label="License Number" value={formData.licenseNumber} />
            <DetailRow label="Fuel Type" value={formData.fuelType} />
        </div>
        <div className="mt-6 space-y-3">
            <button 
                onClick={createAccount} 
                disabled={isCreatingAccount}
                className="w-full bg-primary text-white py-2.5 rounded-full text-base font-semibold shadow-lg transition-all active:scale-95 hover:shadow-xl flex items-center justify-center disabled:bg-primary/70 mobile-btn-md ripple"
            >
                {isCreatingAccount ? 'Creating Account...' : 'Create Account'}
            </button>
            <button onClick={editDetails} className="w-full text-primary py-2.5 rounded-full text-base font-semibold transition-all active:scale-95 hover:shadow-md mobile-btn-md ripple">Edit Details</button>
        </div>
    </div>
);


export default RegistrationScreen;