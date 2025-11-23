import React from 'react';
import { NavLink } from 'react-router-dom';

// Import the image assets
import homeIcon from '../assets/icons/home.png';
import myOrdersIcon from '../assets/icons/my-orders.png';
import trackOrderIcon from '../assets/icons/track-order.png';
import settingsIcon from '../assets/icons/settings.png';

const NavItem = ({ to, icon, label }: { to: string; icon: string; label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex flex-col items-center justify-center space-y-0.5 w-full transition-all active:scale-90 ${
                isActive ? 'text-primary' : 'text-gray-400'
            }`
        }
    >
        {({ isActive }) => (
            <>
                <img 
                    src={icon} 
                    alt={label} 
                    className="w-6 h-6 object-contain transition-all"
                    style={{
                        filter: isActive ? 'brightness(0) saturate(100%) invert(58%) sepia(89%) saturate(426%) hue-rotate(93deg) brightness(94%) contrast(87%)' : 'none'
                    }}
                />
                <span className={`text-[10px] mt-0.5 font-semibold transition-all ${isActive ? 'scale-105' : 'scale-100'}`}>{label}</span>
            </>
        )}
    </NavLink>
);

const BottomNav = () => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-light-bg/95 dark:bg-dark-card/95 backdrop-blur-md border-t border-light-border dark:border-dark-border shadow-lg w-full" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex justify-around items-center h-16 px-2">
                <NavItem to="/home" icon={homeIcon} label="Home" />
                <NavItem to="/orders" icon={myOrdersIcon} label="My Orders" />
                <NavItem to="/track" icon={trackOrderIcon} label="Track Order" />
                <NavItem to="/settings" icon={settingsIcon} label="Settings" />
            </div>
        </footer>
    );
};

export default BottomNav;