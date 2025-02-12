import React from 'react';
import { X, Wallet, ArrowRight, Building2, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlusModal = ({ isOpen, onClose, buttonPosition }) => {
  const navigate = useNavigate();

  const menuColumns = [
    {
      title: "Contabilidad",
      icon: <Wallet className="w-5 h-5 text-green-600" />,
      description: "Gestiona tus cuentas y movimientos",
      items: [
        { label: "Nuevo Egreso", path: "/transactions/new" },
        { label: "Nuevo Arqueo", path: "/index/moneymanager/transactions/nuevoingreso" },
        { label: "Nueva Venta", path: "/transactions/new" },
        { label: "Nueva Transferencia", path: "/transactions/new" },
        { label: "Nueva Cuenta", path: "/transactions/new" },
      ]
    },
    {
      title: "Contactos",
      icon: <Building2 className="w-5 h-5 text-violet-600" />,
      description: "Administra tus relaciones comerciales",
      items: [
        { label: "Nuevo Proveedor", path: "/index/moneymanager/terceros" },
        { label: "Nuevo Cliente", path: "/categories/new" }
      ]
    },
    {
      title: "Organización",
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
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
      {/* Fondo oscuro */}
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />

      {/* Contenedor del menú */}
      <div className="fixed top-[4em] right-72 w-[900px] bg-white shadow-xl rounded-lg border border-gray-100">
        {/* Flecha superior */}
        <div className="absolute -top-2 right-8 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100" />

        {/* Contenido */}
        <div className="p-6">
          {/* Encabezado */}
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

          {/* Columnas del menú */}
          <div className="grid grid-cols-3 gap-6">
            {menuColumns.map((column, idx) => (
              <div key={idx}>
                {/* Título con ícono */}
                <div className="flex items-center gap-2 mb-4">
                  {column.icon}
                  <h3 className="text-sm font-medium text-gray-900">{column.title}</h3>
                </div>

                {/* Descripción */}
                <p className="text-xs text-gray-500 mb-3">{column.description}</p>

                {/* Acciones */}
                <div className="space-y-2">
                  {column.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      className="w-full group flex items-center gap-3  rounded-md hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                    >
                      <div className="flex-grow text-left">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {item.label}
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