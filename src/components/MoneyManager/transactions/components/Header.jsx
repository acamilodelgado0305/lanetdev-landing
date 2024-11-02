import React, { useState } from 'react';

const NavItem = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex justify-center items-center px-3 h-10 text-sm transition-colors duration-200 relative group flex-1
      ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
    >
        <span>{label}</span>
        {isActive && (
            <div className="absolute bottom-0 left-1/4 w-1/2 h-1 bg-blue-600" />
        )}
    </button>
);

const Header = ({ onNavClick }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const navItems = [
        { label: 'Gastos', endpoint: '/expenses' },
        { label: 'Ingresos', endpoint: '/incomes' },
        { label: 'Transferencias', endpoint: '/transactions' },
        { label: 'Pagos Recurrentes', endpoint: '/recurring-payments' },
    ];

    const handleNavClick = (index, endpoint) => {
        setActiveIndex(index);
        onNavClick(endpoint);
    };

    return (
        <header className="bg-white shadow-sm w-full">
            <div className="flex justify-between px-4 py-2">
                {navItems.map((item, index) => (
                    <NavItem
                        key={index}
                        label={item.label}
                        isActive={activeIndex === index}
                        onClick={() => handleNavClick(index, item.endpoint)}
                    />
                ))}
            </div>
        </header>
    );
};

export default Header;
