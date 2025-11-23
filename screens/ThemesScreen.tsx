import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Monitor } from 'lucide-react';
import { useAppContext } from '../App';
import { Theme } from '../types';
import AnimatedPage from '../components/AnimatedPage';

const ThemesScreen = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useAppContext();

    const themeOptions = [
        {
            id: Theme.LIGHT,
            name: 'Light',
            icon: <Sun size={24} />,
            description: 'Bright and clean interface'
        },
        {
            id: Theme.DARK,
            name: 'Dark',
            icon: <Moon size={24} />,
            description: 'Easy on the eyes at night'
        },
        {
            id: Theme.DEFAULT,
            name: 'System',
            icon: <Monitor size={24} />,
            description: 'Follow your device settings'
        }
    ];

    const handleThemeChange = (selectedTheme: Theme) => {
        setTheme(selectedTheme);
    };

    return (
        <AnimatedPage>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-light-text dark:text-dark-text">
            <header className="p-4 flex items-center sticky top-0 bg-gray-50 dark:bg-dark-bg z-10">
                <button onClick={() => navigate('/settings')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-center flex-grow -ml-10">Themes</h2>
            </header>

            <div className="p-4">
                <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 mb-6">
                    <h3 className="font-bold text-lg mb-2">Choose Your Theme</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Select a theme that suits your preference
                    </p>
                </div>

                <div className="space-y-4">
                    {themeOptions.map((option) => (
                        <div 
                            key={option.id}
                            onClick={() => handleThemeChange(option.id)}
                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-colors ${
                                theme === option.id 
                                    ? 'bg-primary/20 border-2 border-primary' 
                                    : 'bg-light-card dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-dark-card'
                            }`}
                        >
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-primary/10 text-primary mr-4">
                                    {option.icon}
                                </div>
                                <div>
                                    <p className="font-semibold">{option.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                                </div>
                            </div>
                            {theme === option.id && (
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <h4 className="font-bold mb-2">Theme Preview</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Changing themes will update the appearance of the entire application.
                        Select "System" to automatically follow your device's theme settings.
                    </p>
                </div>
            </div>
        </div>
        </AnimatedPage>
    );
};

export default ThemesScreen;