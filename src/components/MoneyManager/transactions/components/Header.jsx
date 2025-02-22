import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, ArrowLeftRight } from 'lucide-react';

const NavItem = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium
      transition-all duration-200 relative
      hover:bg-gray-50
      ${isActive 
        ? 'text-[#007072] bg-[#007072]-50/50' 
        : 'text-gray-600 hover:text-gray-900'
      }
    `}
  >
    <Icon className={`w-4 h-4 ${isActive ? 'text-[#007072]' : 'text-gray-500'}`} />
    <span>{label}</span>
    {isActive && (
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#007072]" />
    )}
  </button>
);

const Header = ({ onNavClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const navItems = [
    { 
      label: 'Ingresos', 
      endpoint: '/incomes',
      icon: ArrowUpCircle
    },
    { 
      label: 'Egresos', 
      endpoint: '/expenses',
      icon: ArrowDownCircle
    },
    { 
      label: 'Transferencias', 
      endpoint: '/transfers',
      icon: ArrowLeftRight
    }
  ];

  const handleNavClick = (index, endpoint) => {
    setActiveIndex(index);
    onNavClick(endpoint);
  };

  return (
    <nav className="mt-[-1em] bg-white w-full">
      <div className="flex justify-center border-b">
        {navItems.map((item, index) => (
          <div 
            key={index}
            className={`
              relative
              ${index !== navItems.length - 1 ? 'after:content-[""] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-6 after:w-px after:bg-gray-200' : ''}
            `}
          >
            <NavItem
              label={item.label}
              icon={item.icon}
              isActive={activeIndex === index}
              onClick={() => handleNavClick(index, item.endpoint)}
            />
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Header;