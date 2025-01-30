import React from 'react';
import { X, Plus, Wallet, Tags, ArrowRight, Users, CreditCard, FileText, Building2, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlusModal = ({ isOpen, onClose, buttonPosition }) => {
  const navigate = useNavigate();

  const menuColumns = [
    {
      title: "Finanzas",
      description: "Gestiona tus cuentas y movimientos",
      items: [
        {
          label: "Nueva Cuenta",
          description: "Crea una cuenta bancaria o de efectivo",
          icon: <Wallet className="w-4 h-4 text-blue-600" />,
          path: "/accounts"
        },
        {
          label: "Nuevo Movimiento",
          description: "Registra ingresos o gastos",
          icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
          path: "/transactions/new"
        }
      ]
    },
    {
      title: "Contactos",
      description: "Administra tus relaciones comerciales",
      items: [
        {
          label: "Nuevo Proveedor",
          description: "Añade un proveedor de servicios",
          icon: <Building2 className="w-4 h-4 text-violet-600" />,
          path: "/index/moneymanager/terceros"
        },
        {
          label: "Nuevo Cliente",
          description: "Registra un nuevo cliente",
          icon: <Users className="w-4 h-4 text-orange-600" />,
          path: "/categories/new"
        }
      ]
    },
    {
      title: "Organización",
      description: "Estructura tu información",
      items: [
        {
          label: "Nueva Categoría",
          description: "Clasifica tus movimientos",
          icon: <Tags className="w-4 h-4 text-pink-600" />,
          path: "/categories/new"
        },
        {
          label: "Nuevo Reporte",
          description: "Genera informes personalizados",
          icon: <BarChart3 className="w-4 h-4 text-indigo-600" />,
          path: "/reports/new"
        }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/20 "
        onClick={onClose}
      />

      <div className="fixed top-[8em] right-8 w-[900px] bg-white shadow-xl rounded-lg border border-gray-100">
        <div className="absolute -top-2 right-8 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100" />

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Menú Rápido</h2>
              <p className="text-sm text-gray-500 mt-1">Accede rápidamente a las funciones más utilizadas</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {menuColumns.map((column, idx) => (
              <div key={idx} className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    {column.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {column.description}
                  </p>
                </div>
                <div className="space-y-1">
                  {column.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      className="w-full group flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                    >
                      <div className="flex-shrink-0 p-2 bg-gray-50 rounded-md group-hover:bg-white transition-colors">
                        {item.icon}
                      </div>
                      <div className="flex-grow text-left">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 group-hover:translate-x-1" />
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