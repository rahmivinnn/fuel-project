import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Save } from 'lucide-react';
import LottieAnimation from '../components/LottieAnimation';
import successAnimation from '../assets/animations/success.json';
import AnimatedPage from '../components/AnimatedPage';

const Stepper = ({ currentStep }: { currentStep: number }) => {
    const steps = [{id: 1, name: "Order"}, {id: 2, name: "Order summary"}, {id: 3, name: "Payment"}];
    return (
        <div className="flex items-center justify-between w-full my-8 px-4">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                                currentStep > step.id ? 'bg-primary text-white' : currentStep === step.id ? 'border-2 border-primary text-primary' : 'border-2 border-gray-300 text-gray-400'
                            }`}
                        >
                            {currentStep > step.id ? <Check size={24} /> : step.id}
                        </div>
                        <p className={`mt-2 text-xs ${currentStep >= step.id ? 'text-primary' : 'text-gray-400'}`}>{step.name}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${currentStep > step.id ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};


const CheckoutScreen = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [orderData, setOrderData] = useState({});

    const handleNext = (data = {}) => {
        setOrderData(prev => ({...prev, ...data}));
        setStep(s => s < 3 ? s + 1 : s);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
        } else {
            navigate(-1);
        }
    };
    
    const [showSuccess, setShowSuccess] = useState(false);

    const handlePayment = async () => {
        // Here you would call an API to process payment
        // For now, we'll just show the success modal
        console.log("Final Order Data:", orderData);
        setShowSuccess(true);
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return <Step1 next={handleNext} />;
            case 2:
                return <Step2 next={handleNext} />;
            case 3:
                return <Step3 pay={handlePayment} />;
            default:
                return <Step1 next={handleNext} />;
        }
    };

    return (
        <AnimatedPage>
        <div className="min-h-screen flex flex-col p-6 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text relative">
            <header className="flex items-center space-x-4 mb-4">
                <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow">Checkout</h2>
            </header>
            
            <Stepper currentStep={step} />

            <div className="flex-grow">
                {renderStep()}
            </div>

            {showSuccess && <SuccessModal />}
        </div>
        </AnimatedPage>
    );
};

const SuccessModal = () => {
    const navigate = useNavigate();
    return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-light-bg dark:bg-dark-card rounded-2xl p-8 text-center w-full max-w-sm flex flex-col items-center">
                <LottieAnimation animationData={successAnimation} width={150} height={150} loop={false} />
                <h3 className="text-xl font-bold mb-2">Your payment has Been made Successfully</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Tracking ID No: #12345</p>
        <button onClick={() => navigate('/track')} className="w-full bg-primary text-white py-3 rounded-full font-semibold mb-3 ripple">Track Order</button>
                <button onClick={() => navigate('/home')} className="w-full text-primary font-semibold ripple">Back To Home</button>
            </div>
        </div>
    )
}

const Step1 = ({ next }: { next: (data: any) => void }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        next(data);
    }
    return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <input name="address" type="text" placeholder="Address" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent" defaultValue="Loreum ipsum" required/>
        <input name="phone" type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent" defaultValue="923556688" required/>
        <div className="grid grid-cols-2 gap-4">
            <input name="vehicleColor" type="text" placeholder="Vehicle Color" className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent" defaultValue="Vehicle Color" required/>
            <input name="vehicleBrand" type="text" placeholder="Vehicle Brand" className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent" defaultValue="Toyota" required/>
            <input name="licensePlate" type="text" placeholder="Number Plate" className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent" defaultValue="Abc 123" required/>
            <select name="fuelType" className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent appearance-none">
                <option>Petrol</option>
                <option>Diesel</option>
            </select>
            <input name="quantity" type="text" placeholder="Quantity" className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent" defaultValue="10 liters" required/>
            <select name="deliveryTime" className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent appearance-none">
                <option>Instant</option>
                <option>Schedule</option>
            </select>
        </div>
        <button type="submit" className="w-full mt-8 bg-primary text-white py-4 rounded-full text-lg font-semibold ripple">Save & Continue</button>
    </form>
    )
};

const DetailRow = ({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) => (
    <div className="flex justify-between py-3 border-b border-dotted border-gray-300 dark:border-gray-600">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
);

const Step2 = ({ next }: { next: () => void }) => (
    <div className="flex flex-col h-full">
        <div className="flex-grow bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-md space-y-1">
            <h3 className="text-lg font-bold text-center mb-4">Fuel order details</h3>
            <DetailRow label="Station Name" value="TurboFuel Express" />
            <DetailRow label="Fuel Type" value="Premium Gasoline" />
            <DetailRow label="Quantity" value="10 liters" />
            <DetailRow label="Chocolate Cookies" value="$20.00" />
            <DetailRow label="Delivery Time" value="Today, 12:30 AM" />
            <DetailRow label="Vehicle Brand" value="Honda" />
            <DetailRow label="Vehicle color" value="Red" />
            <DetailRow label="License Number" value="CAN-1234" />
            <DetailRow label="Fuel Cost" value="$90.00" />
            <DetailRow label="Delivery Fee" value="$10.00" />
            <DetailRow label="Total Amount" value="$120.00" valueClass="text-primary text-lg" />
        </div>
        <div className="mt-8 space-y-4">
        <button onClick={next} className="w-full bg-primary text-white py-4 rounded-full text-lg font-semibold ripple">Confirm Payment & Address</button>
            <button className="w-full text-primary py-2 rounded-full text-sm font-semibold ripple">Edit Details</button>
        </div>
    </div>
);

const Step3 = ({ pay }: { pay: () => void }) => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setPaymentMethod('card')} className={`p-3 rounded-lg flex flex-col items-center justify-center border-2 ${paymentMethod === 'card' ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                    <CreditCard />
                    <span className="text-xs mt-1">Credit card</span>
                </button>
                 <button onClick={() => setPaymentMethod('paypal')} className={`p-3 rounded-lg flex flex-col items-center justify-center border-2 ${paymentMethod === 'paypal' ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                    <img src="https://www.paypalobjects.com/webstatic/mktg/logo-center/PP_Acceptance_Marks_for_LogoCenter_114x29.png" className="h-6 object-contain"/>
                </button>
                 <button onClick={() => setPaymentMethod('apple')} className={`p-3 rounded-lg flex flex-col items-center justify-center border-2 ${paymentMethod === 'apple' ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600'}`}>
                    <img src="https://developer.apple.com/assets/elements/badges/apple-pay-logo.svg" className="h-6 object-contain"/>
                </button>
            </div>
            
            <div className="bg-slate-700 text-white p-4 rounded-xl relative h-48 flex flex-col justify-between">
                <div>
                    <p className="text-sm">BANK NAME</p>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" className="h-8 absolute top-4 right-4" />
                </div>
                <p className="text-2xl tracking-widest">1844 444 7860</p>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs">Holder Name</p>
                        <p>Loreum Ipsum</p>
                    </div>
                    <div>
                        <p className="text-xs">Exp. Date</p>
                        <p>10/28</p>
                    </div>
                </div>
            </div>

            <input type="text" placeholder="Card holder name" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent" />
            <input type="text" placeholder="Card Number" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent" />
            <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Expiry Date" className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent" />
                <input type="text" placeholder="CVV Code" className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent" />
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="save-card" className="h-4 w-4 rounded text-primary focus:ring-primary" defaultChecked />
                <label htmlFor="save-card" className="ml-2 block text-sm">Save card information</label>
            </div>
            <button onClick={pay} className="w-full mt-8 bg-primary text-white py-4 rounded-full text-lg font-semibold ripple">Pay Now</button>
        </div>
    );
}

export default CheckoutScreen;
