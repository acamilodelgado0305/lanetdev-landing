import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Briefcase, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getAccounts } from "../../../services/moneymanager/moneyService";

const Summary = ({
  totalIncome,
  totalExpenses,
  balance
}) => {
  const [cuentas, setCuentas] = useState([]);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expensesCategories, setExpensesCategories] = useState([]);
  
  const formatCurrency = (amount) => {
    if (isNaN(amount)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const fetchCuentas = async () => {
    try {
      const data = await getAccounts();
      setCuentas(data);
    } catch (err) {
      setError("Error al cargar las cuentas");
     
    }
  };
  
  useEffect(() => {
    fetchCuentas();
    
    // Si tenemos acceso a datos históricos, los cargaríamos aquí
    // Este es solo un esqueleto para cuando se conecte con la API real
    if (totalIncome > 0 || totalExpenses > 0) {
      // Generar datos solo para la visualización basados en los totales actuales
      setMonthlyData([
        { name: 'Actual', ingresos: totalIncome, egresos: totalExpenses }
      ]);
    }
  }, [totalIncome, totalExpenses]);
  
  // Colores para gráficos
  const COLORS = ['#0052CC', '#00C7E6', '#36B37E', '#FF5630', '#6554C0', '#FFAB00'];
  
  return (
    <div className="bg-blue-900 bg-opacity-20  shadow-lg">
      {/* Header similar a Jira */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard Financiero</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">Última actualización: Hoy</span>
              <button 
                className="bg-[#0052CC] hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                onClick={fetchCuentas}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="max-w-full mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta de Ingresos */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-2 mr-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-700">Ingresos Totales</h2>
              </div>
              {cuentas.length > 0 && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 
                  {cuentas.filter(c => c.plus).length} cuentas
                </span>
              )}
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-800">{formatCurrency(totalIncome)}</div>
              <p className="text-sm text-gray-500">Total de ingresos</p>
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name: 'Total', valor: totalIncome}]}>
                  <Bar dataKey="valor" fill="#36B37E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Tarjeta de Egresos */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="rounded-full bg-red-100 p-2 mr-3">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-700">Egresos Totales</h2>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-800">{formatCurrency(totalExpenses)}</div>
              <p className="text-sm text-gray-500">Total de egresos</p>
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name: 'Total', valor: totalExpenses}]}>
                  <Bar dataKey="valor" fill="#FF5630" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Tarjeta de Balance */}
          <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-700">Balance Total</h2>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-2xl font-bold text-gray-800">{formatCurrency(balance)}</div>
              <p className="text-sm text-gray-500">Diferencia ingresos - egresos</p>
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Balance', ingresos: totalIncome, egresos: totalExpenses }
                ]}>
                  <Bar dataKey="ingresos" fill="#36B37E" />
                  <Bar dataKey="egresos" fill="#FF5630" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Sección de gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Gráfico de comparación - Ingresos vs Egresos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Ingresos vs Egresos</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Ingresos', value: totalIncome },
                      { name: 'Egresos', value: totalExpenses }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#36B37E" />
                    <Cell fill="#FF5630" />
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Listado de cuentas */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700">Resumen de Cuentas</h2>
            </div>
            {error && (
              <div className="px-6 py-4 text-red-500">
                {error}
              </div>
            )}
            <div className="divide-y divide-gray-200">
              {cuentas.length > 0 ? (
                cuentas.map((cuenta) => (
                  <div key={cuenta.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="rounded-full bg-blue-100 p-2 mr-3">
                        {cuenta.type === "Banco" ? (
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Briefcase className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">{cuenta.name}</h3>
                        <p className="text-xs text-gray-500">{cuenta.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-800">
                        {formatCurrency(parseFloat(cuenta.balance))}
                      </div>
                      <div className={`text-xs ${cuenta.plus ? 'text-green-600' : 'text-red-600'}`}>
                        {cuenta.plus ? 'Activo' : 'Pasivo'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-gray-500">
                  No hay cuentas disponibles
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;