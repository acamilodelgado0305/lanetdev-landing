import React from 'react';
import { Calendar, Clock, DollarSign, Hash, Tag, FileText, User, CreditCard, Wallet, MessageSquare } from 'lucide-react';

const IncomeInvoiceView = () => {
  // Simular que recibimos el ID de la URL
  const incomeId = "ad515742-11ab-497a-8f8c-0e4e05bf5bc5";
  
  // Datos del ingreso (normalmente se obtendrían de una API usando el ID)
  const incomeData = {
    "id": "ad515742-11ab-497a-8f8c-0e4e05bf5bc5",
    "user_id": 4,
    "account_id": 1,
    "category_id": null,
    "amount": "600000.00",
    "type": "arqueo",
    "date": "2025-02-25T16:41:56.000Z",
    "voucher": [],
    "description": "prueba",
    "estado": true,
    "amountfev": "200000.00",
    "amountdiverse": "200000.00",
    "cashier_id": null,
    "arqueo_number": "12123",
    "other_income": "200000.00",
    "cash_received": "600000.00",
    "cashier_commission": "12000",
    "start_period": "2025-01-01T05:00:00.000Z",
    "end_period": "2025-01-31T05:00:00.000Z",
    "comentarios": "purba"
  };

  // Función para formatear fechas
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para formatear montos
  const formatAmount = (amount) => {
    return parseFloat(amount).toLocaleString('es-ES', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  };

  // Colores Jira
  const jiraColors = {
    blue: "#0052CC",
    green: "#00875A",
    lightBlue: "#DEEBFF",
    lightGreen: "#E3FCEF",
    lightGray: "#F4F5F7",
    darkGray: "#42526E",
    border: "#DFE1E6",
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-full mx-auto bg-white rounded-md shadow-md overflow-hidden border border-gray-200">
        {/* Encabezado de tipo Factura */}
        <div style={{ backgroundColor: jiraColors.blue }} className="p-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">Registro de Ingreso</h1>
            </div>
            <div className="text-right">
              <p className="text-sm mb-1">Fecha del Registro</p>
              <p className="font-bold">{formatDate(incomeData.date)}</p>
            </div>
          </div>
        </div>
        
        {/* Información principal tipo factura */}
        <div className="border-b" style={{ borderColor: jiraColors.border }}>
          <div className="grid grid-cols-2 divide-x" style={{ borderColor: jiraColors.border }}>
            <div className="p-4">
              <h2 className="font-semibold mb-2" style={{ color: jiraColors.darkGray }}>Referencia</h2>
              <div className="flex items-center space-x-2">
                <Hash size={16} style={{ color: jiraColors.blue }} />
                <span className="font-bold text-lg">Arqueo #{incomeData.arqueo_number}</span>
              </div>
              <div className="mt-1 flex items-center">
                <Tag size={14} className="mr-1" style={{ color: jiraColors.darkGray }} />
                <span>ID: {incomeData.id.substring(0, 8)}...</span>
              </div>
            </div>
            <div className="p-4">
              <h2 className="font-semibold mb-2" style={{ color: jiraColors.darkGray }}>Estado</h2>
              <div className="flex items-center space-x-2">
                <span 
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: incomeData.estado ? jiraColors.lightGreen : jiraColors.lightGray,
                    color: incomeData.estado ? jiraColors.green : jiraColors.darkGray
                  }}
                >
                  {incomeData.estado ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información del periodo */}
        <div className="border-b p-4" style={{ borderColor: jiraColors.border, backgroundColor: jiraColors.lightBlue }}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold" style={{ color: jiraColors.darkGray }}>Período del Arqueo</h2>
              <div className="flex items-center mt-1">
                <Calendar size={14} className="mr-1" style={{ color: jiraColors.blue }} />
                <span>{formatDate(incomeData.start_period)} - {formatDate(incomeData.end_period)}</span>
              </div>
            </div>
            <div className="text-right">
              <h2 className="font-semibold" style={{ color: jiraColors.darkGray }}>Total Ingreso</h2>
              <div className="text-2xl font-bold" style={{ color: jiraColors.blue }}>{formatAmount(incomeData.amount)}</div>
            </div>
          </div>
        </div>

        {/* Tabla de detalles */}
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: jiraColors.lightGray }}>
              <th className="py-3 px-4 text-left font-semibold" style={{ color: jiraColors.darkGray }}>Concepto</th>
              <th className="py-3 px-4 text-left font-semibold" style={{ color: jiraColors.darkGray }}>Detalle</th>
              <th className="py-3 px-4 text-right font-semibold" style={{ color: jiraColors.darkGray }}>Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: jiraColors.border }}>
            <tr>
              <td className="py-3 px-4 flex items-center">
                <Wallet size={16} className="mr-2" style={{ color: jiraColors.blue }} />
                <span>Efectivo Recibido</span>
              </td>
              <td className="py-3 px-4">Arqueo de Caja</td>
              <td className="py-3 px-4 text-right font-medium">{formatAmount(incomeData.cash_received)}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 flex items-center">
                <DollarSign size={16} className="mr-2" style={{ color: jiraColors.blue }} />
                <span>Monto FEV</span>
              </td>
              <td className="py-3 px-4">Fondo Especial de Valores</td>
              <td className="py-3 px-4 text-right font-medium">{formatAmount(incomeData.amountfev)}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 flex items-center">
                <DollarSign size={16} className="mr-2" style={{ color: jiraColors.blue }} />
                <span>Monto Diverso</span>
              </td>
              <td className="py-3 px-4">Ingresos Diversos</td>
              <td className="py-3 px-4 text-right font-medium">{formatAmount(incomeData.amountdiverse)}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 flex items-center">
                <DollarSign size={16} className="mr-2" style={{ color: jiraColors.blue }} />
                <span>Otros Ingresos</span>
              </td>
              <td className="py-3 px-4">Ingresos Adicionales</td>
              <td className="py-3 px-4 text-right font-medium">{formatAmount(incomeData.other_income)}</td>
            </tr>
            <tr style={{ backgroundColor: jiraColors.lightGray }}>
              <td className="py-3 px-4 flex items-center">
                <DollarSign size={16} className="mr-2" style={{ color: jiraColors.darkGray }} />
                <span className="font-semibold">Comisión de Cajero</span>
              </td>
              <td className="py-3 px-4">Comisión por Servicios</td>
              <td className="py-3 px-4 text-right font-medium">{formatAmount(incomeData.cashier_commission)}</td>
            </tr>
            <tr className="border-t-2" style={{ borderColor: jiraColors.blue }}>
              <td className="py-3 px-4 font-bold" style={{ color: jiraColors.darkGray }}>Total</td>
              <td className="py-3 px-4"></td>
              <td className="py-3 px-4 text-right font-bold" style={{ color: jiraColors.blue }}>{formatAmount(incomeData.amount)}</td>
            </tr>
          </tbody>
        </table>

        {/* Información adicional */}
        <div className="grid grid-cols-2 divide-x border-t" style={{ borderColor: jiraColors.border }}>
          <div className="p-4">
            <h2 className="font-semibold mb-2" style={{ color: jiraColors.darkGray }}>Información de Usuario</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 flex items-center" style={{ color: jiraColors.darkGray }}>
                    <User size={14} className="mr-1" style={{ color: jiraColors.blue }} />
                    <span>ID Usuario:</span>
                  </td>
                  <td className="py-1">{incomeData.user_id}</td>
                </tr>
                <tr>
                  <td className="py-1 flex items-center" style={{ color: jiraColors.darkGray }}>
                    <CreditCard size={14} className="mr-1" style={{ color: jiraColors.blue }} />
                    <span>ID Cuenta:</span>
                  </td>
                  <td className="py-1">{incomeData.account_id}</td>
                </tr>
                <tr>
                  <td className="py-1 flex items-center" style={{ color: jiraColors.darkGray }}>
                    <Tag size={14} className="mr-1" style={{ color: jiraColors.blue }} />
                    <span>Tipo:</span>
                  </td>
                  <td className="py-1 capitalize">{incomeData.type}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4">
            <h2 className="font-semibold mb-2" style={{ color: jiraColors.darkGray }}>Descripción y Comentarios</h2>
            <div className="mb-2">
              <div className="flex items-start">
                <FileText size={14} className="mr-1 mt-1" style={{ color: jiraColors.blue }} />
                <div>
                  <p className="text-sm" style={{ color: jiraColors.darkGray }}>Descripción:</p>
                  <p>{incomeData.description}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start">
                <MessageSquare size={14} className="mr-1 mt-1" style={{ color: jiraColors.blue }} />
                <div>
                  <p className="text-sm" style={{ color: jiraColors.darkGray }}>Comentarios:</p>
                  <p>{incomeData.comentarios}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de página */}
        <div className="p-3 text-xs text-center border-t" style={{ backgroundColor: jiraColors.lightGray, borderColor: jiraColors.border, color: jiraColors.darkGray }}>
          <div className="flex justify-between items-center">
            <div>Money Manager v1.0</div>
            <div className="flex items-center">
              <Clock size={12} className="mr-1" />
              <span>Generado el: {formatDate(new Date())}</span>
            </div>
            <div>ID: {incomeData.id}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeInvoiceView;