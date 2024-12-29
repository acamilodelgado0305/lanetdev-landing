import React from 'react';
import { TrendingUp, DollarSign, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const formatCurrency = (amount) => {
  if (isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className={`flex items-center text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {trend === 'up' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        {trendValue}%
      </span>
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
    <p className="text-2xl font-bold text-gray-800">{formatCurrency(value)}</p>
  </div>
);

const calculateTrend = (current, previous) => {
  if (!previous) return 0;
  return ((current - previous) / Math.abs(previous) * 100).toFixed(1);
};

const FinancialSummary = ({ 
  generalBalance, 
  pendingPayments, 
  timeRange, 
  onTimeRangeChange 
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panel Financiero</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => onTimeRangeChange('week')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 'week' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => onTimeRangeChange('month')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 'month' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => onTimeRangeChange('year')}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 'year' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            Año
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Balance General"
          value={generalBalance.net_balance}
          trend={generalBalance.net_balance >= 0 ? "up" : "down"}
          trendValue={Math.abs(calculateTrend(generalBalance.net_balance, 0))}
          icon={DollarSign}
          color="bg-indigo-600"
        />
        <StatCard
          title="Ingresos Totales"
          value={generalBalance.total_incomes}
          trend="up"
          trendValue={calculateTrend(generalBalance.total_incomes, 0)}
          icon={TrendingUp}
          color="bg-green-600"
        />
        <StatCard
          title="Gastos Totales"
          value={generalBalance.total_expenses}
          trend="down"
          trendValue={calculateTrend(generalBalance.total_expenses, 0)}
          icon={TrendingUp}
          color="bg-red-600"
        />
        <StatCard
          title="Pagos Pendientes"
          value={pendingPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)}
          trend="up"
          trendValue="2"
          icon={AlertCircle}
          color="bg-amber-600"
        />
      </div>
    </div>
  );
};

export default FinancialSummary;