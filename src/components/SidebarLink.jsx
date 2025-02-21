import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from 'lucide-react';

const SidebarLink = ({ 
  to, 
  label, 
  icon: Icon, 
  isExpanded, 
  isActive, 
  hasSubmenu, 
  submenuItems, 
  onSubmenuClick,
  isSubmenuOpen 
}) => {
  return (
    <div className="relative">
      <Link
        to={to || '#'}
        className={`
          flex items-center p-2 
          transition-colors duration-200
          ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5'}
          ${isExpanded ? 'justify-start' : 'justify-center'}
        `}
        onClick={(e) => {
          if (hasSubmenu) {
            e.preventDefault();
            onSubmenuClick && onSubmenuClick();
          }
        }}
      >
        {Icon && <Icon className={`${isExpanded ? 'mr-3' : ''} w-5 h-5`} />}
        {isExpanded && (
          <span className="flex-1 truncate">{label}</span>
        )}
        {hasSubmenu && isExpanded && (
          <ChevronDownIcon 
            className={`w-4 h-4 transform transition-transform duration-200 
              ${isSubmenuOpen ? 'rotate-180' : ''}`} 
          />
        )}
      </Link>

      {hasSubmenu && isSubmenuOpen && isExpanded && (
        <div className="pl-4 mt-1 space-y-1">
          {submenuItems.map((subitem) => (
            <Link
              key={subitem.to}
              to={subitem.to}
              className={`
                flex items-center p-2 text-sm rounded-lg 
                transition-colors duration-200 
                hover:bg-white/10
                ${window.location.pathname === subitem.to 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-300'}
              `}
            >
              {subitem.icon && <subitem.icon className="mr-2 w-4 h-4" />}
              {subitem.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarLink;