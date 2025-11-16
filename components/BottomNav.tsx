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
            `flex flex-col items-center justify-center space-y-1 w-full text-sm md:text-base transition-transform active:scale-95 hover:opacity-90 ${
                isActive ? 'text-primary' : 'text-gray-400'
            }`
        }
    >
        <img src={icon} alt={label} className={`w-8 h-8 md:w-10 md:h-10 object-contain ${'rounded-full'} ${'ring-0'} ${''}`} />
        <span className="text-xs md:text-sm mt-1">{label}</span>
    </NavLink>
);

const BottomNav = () => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-light-bg dark:bg-dark-card border-t border-light-border dark:border-dark-border shadow-t-lg w-full" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex justify-around items-center h-20 md:h-24 px-2 md:px-4">
                <NavItem to="/home" icon={homeIcon} label="Home" />
                <NavItem to="/orders" icon={myOrdersIcon} label="My Orders" />
                <NavItem to="/track" icon={trackOrderIcon} label="Track Order" />
                <NavItem to="/settings" icon={settingsIcon} label="Settings" />
            </div>
        </footer>
    );
};

export default BottomNav;