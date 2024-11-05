import React, { useState } from 'react';

const NavItem = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex justify-center items-center  h-10 text-sm transition-colors duration-200 relative group flex-1
      ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
    >
        <span>{label}</span>
        {isActive && (
            <div className="absolute bottom-0  w-full h-1 bg-[#293A4C]" />
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
            <div className="flex justify-between py-1">
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
