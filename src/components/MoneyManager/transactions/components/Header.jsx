import React, { useState } from 'react';
import { BarChart2, Send, DollarSign, Repeat, User } from 'lucide-react';

const NavItem = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center px-3 h-10 text-sm transition-colors duration-200 relative group
      ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
    >
        <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
        <span>{label}</span>
        {isActive && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
        )}
    </button>
);

const Header = ({ onNavClick }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const navItems = [
        { label: 'Gastos', icon: BarChart2, endpoint: '/expenses' },
        { label: 'Ingresos', icon: DollarSign, endpoint: '/incomes' },
        { label: 'Transacciones', icon: Send, endpoint: '/transactions' },
        { label: 'Pagos Recurrentes', icon: Repeat, endpoint: '/recurring-payments' },

    ];

    const handleNavClick = (index, endpoint) => {
        setActiveIndex(index);
        onNavClick(endpoint); // Llama a la función pasada para realizar la solicitud
    };

    return (
        <header className="bg-white shadow-sm w-full ">
            <div className="flex justify-end space-x-4 px-4 py-2">
                {navItems.map((item, index) => (
                    <NavItem
                        key={index}
                        label={item.label}
                        icon={item.icon}
                        isActive={activeIndex === index}
                        onClick={() => handleNavClick(index, item.endpoint)}
                    />
                ))}
            </div>
        </header>
    );
};

export default Header;
