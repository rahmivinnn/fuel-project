import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, LogOut, Camera } from 'lucide-react';
import { useAppContext } from '../App';
import { apiUpdateUserProfile } from '../services/api';
import { User } from '../types';
import AnimatedPage from '../components/AnimatedPage';

const ProfileInput = ({ label, value, name, onChange, type = "text", disabled = false }: { label: string, value: string, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, disabled?: boolean }) => (
    <div>
        <label className="text-sm text-gray-500 dark:text-gray-400">{label}</label>
        <input 
            type={type} 
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full mt-1 px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent disabled:opacity-70"
        />
    </div>
);

const ProfileScreen = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User | null>(user);

    useEffect(() => {
        setFormData(user);
    }, [user]);

    if (!formData) {
        return <div>Loading profile...</div>; // Or a proper loader
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.startsWith('vehicle.')) {
            const vehicleField = name.split('.')[1];
            setFormData(prev => {
                if (!prev) return null;
                const updatedVehicles = [...prev.vehicles];
                if (updatedVehicles.length > 0) {
                   (updatedVehicles[0] as any)[vehicleField] = value;
                }
                return { ...prev, vehicles: updatedVehicles };
            });
        } else {
             setFormData(prev => prev ? { ...prev, [name]: value } : null);
        }
    };

    const handleSave = async () => {
        if (!formData) return;
        try {
            const updatedUser = await apiUpdateUserProfile(formData);
            updateUser(updatedUser);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to save changes.");
        }
    };

    const handleCancel = () => {
        setFormData(user);
        setIsEditing(false);
    }
    
    const vehicle = formData.vehicles[0] || {};

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-white dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-white dark:bg-dark-bg z-10">
                <button onClick={() => isEditing ? handleCancel() : navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold">My Profile</h2>
                <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card ${isEditing ? 'text-primary' : ''}`}>
                    <Edit size={24} />
                </button>
            </header>

            <div className="p-4">
                <div className="flex flex-col items-center space-y-4 mb-8">
                    <div className="relative">
                        <img src={formData.avatarUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
                        {isEditing && (
                            <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full">
                                <Camera size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Personal Details</h3>
                    <ProfileInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing} />
                    <ProfileInput label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} type="tel" disabled={!isEditing} />
                    <ProfileInput label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" disabled={!isEditing} />
                    <ProfileInput label="City of Residence" name="city" value={formData.city} onChange={handleChange} disabled={!isEditing} />

                    <h3 className="font-bold text-lg mt-6">Vehicle Details</h3>
                    <ProfileInput label="Vehicle Make and Model" name="vehicle.brand" value={vehicle.brand || ''} onChange={handleChange} disabled={!isEditing} />
                    <ProfileInput label="Vehicle Color" name="vehicle.color" value={vehicle.color || ''} onChange={handleChange} disabled={!isEditing} />
                    <ProfileInput label="License Number" name="vehicle.licenseNumber" value={vehicle.licenseNumber || ''} onChange={handleChange} disabled={!isEditing} />
                </div>

                <div className="mt-8">
                    {isEditing ? (
                        <button onClick={handleSave} className="w-full bg-primary text-white py-4 rounded-full font-bold">
                            Save Changes
                        </button>
                    ) : (
                        <button onClick={logout} className="w-full bg-red-500/10 text-red-500 py-4 rounded-full font-bold flex items-center justify-center">
                            <LogOut size={20} className="mr-2" />
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </div>
        </AnimatedPage>
    );
};

export default ProfileScreen;
