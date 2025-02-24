import React from 'react';
import { X, Wallet, ArrowRight, Building2, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlusModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const menuColumns = [
    {
      title: "CMR",
      icon: <Wallet className="w-5 h-5 text-[#0052CC]" />,
      description: "Gestiona tus cuentas y movimientos",
      items: [
        { label: "Nuevo Egreso", path: "/transactions/new" },
        { label: "Nueva Venta", path: "/transactions/new" },
        { label: "Nueva Transferencia", path: "/transactions/new" },
      ]
    },
    {
      title: "COMPAÑIA",
      icon: <Building2 className="w-5 h-5 text-[#0052CC]" />,
      description: "Administra tus relaciones comerciales",
      items: [
        { label: "Nuevo Arqueo", path: "/index/moneymanager/transactions/nuevoingreso" },
        { label: "Nueva Cuenta", path: "/transactions/new" },
        { label: "Nuevo Cajero", path: "/index/terceros/cajeros/nuevo" },
        { label: "Nuevo Cliente", path: "/categories/new" }
      ]
    },
    {
      title: "Organización",
      icon: <BarChart3 className="w-5 h-5 text-[#0052CC]" />,
      description: "Estructura tu información",
      items: [
        { label: "Nueva Categoría", path: "/categories/new" },
        { label: "Nuevo Reporte", path: "/reports/new" }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#091e420f]" onClick={onClose} />

      {/* Modal Container */}
      <div className="fixed top-16 right-36 w-[600px] bg-white shadow-lg rounded-md border border-gray-200">
        {/* Arrow */}
        <div className="absolute -top-2 right-24 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200" />

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-[#44546f] text-lg font-medium">Menú Rápido</h2>
             
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#091e420f] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#44546f]" />
            </button>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-3 gap-4">
            {menuColumns.map((column, idx) => (
              <div key={idx} className="p-3">
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-3">
                  {column.icon}
                  <h3 className="text-sm font-medium text-[#44546f]">{column.title}</h3>
                </div>

                {/* Description */}
                <p className="text-xs text-[#44546f]/70 mb-3">{column.description}</p>

                {/* Items */}
                <div className="space-y-1">
                  {column.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      className="w-full group flex items-center gap-2 p-2 rounded hover:bg-[#091e420f] transition-colors"
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                    >
                      <span className="flex-grow text-left text-sm text-[#44546f] group-hover:text-[#0052CC]">
                        {item.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#44546f]/50 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlusModal;