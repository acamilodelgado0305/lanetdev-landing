import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, AlertCircle, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { getAccounts, getCategorias, getTransactions, getTransfers } from '../../../services/moneymanager/moneyService.js';
import axios from 'axios';
import { format as formatDate } from 'date-fns';
import { Link } from "react-router-dom";
import { BankOutlined, WalletOutlined } from '@ant-design/icons';

const VITE_API_FINANZAS = import.meta.env.VITE_API_FINANZAS;

const Dashboard = () => {
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [generalBalance, setGeneralBalance] = useState({
    total_incomes: 0,
    total_expenses: 0,
    net_balance: 0
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch general balance junto con los otros datos
        const [accountsData, categoriesData, transactionsData, transfersData, balanceData] = await Promise.all([
          getAccounts(),
          getCategorias(),
          getTransactions(),
          getTransfers(),
          axios.get(`${VITE_API_FINANZAS}/balance/general`),
        ]);

        setAccounts(accountsData);
        setCategories(categoriesData);
        setTransactions(transactionsData);
        setTransfers(transfersData);
        setGeneralBalance({
          total_incomes: parseFloat(balanceData.data.total_incomes) || 0,
          total_expenses: parseFloat(balanceData.data.total_expenses) || 0,
          net_balance: parseFloat(balanceData.data.net_balance) || 0
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const calculateTrend = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / Math.abs(previous) * 100).toFixed(1);
  };

  const fetchMonthlyData = async () => {
    const monthYear = formatDate(currentMonth, "yyyy-MM");
    try {
      const [balanceResponse, incomeResponse, expensesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/transactions/balance/month/${monthYear}`),
        axios.get(`${API_BASE_URL}/transactions/income/month/${monthYear}`),
        axios.get(`${API_BASE_URL}/transactions/expenses/month/${monthYear}`),
      ]);

      setMonthlyStats({
        balance: parseFloat(balanceResponse.data.balance) || 0,
        totalIncome: parseFloat(incomeResponse.data.totalIncome) || 0,
        totalExpenses: parseFloat(expensesResponse.data.totalExpenses) || 0
      });
    } catch (err) {
      console.error("Error fetching monthly data:", err);
      setError("Error al cargar los datos mensuales");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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

  const getSpendingTrends = () => {
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!acc[monthYear]) {
        acc[monthYear] = {
          name: monthYear,
          income: 0,
          expenses: 0,
          savings: 0
        };
      }
      if (transaction.type === 'income') {
        acc[monthYear].income += Number(transaction.amount) || 0;
      } else {
        acc[monthYear].expenses += Number(transaction.amount) || 0;
      }
      acc[monthYear].savings = acc[monthYear].income - acc[monthYear].expenses;
      return acc;
    }, {});
    return Object.values(monthlyData);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">


        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Trends */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tendencias de Gastos e Ingresos</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getSpendingTrends()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="expenses" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="savings" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Categorías</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Transacciones Recientes</h2>
              <Link to="/index/moneymanager/transactions">

                <button className="text-indigo-600 hover:text-indigo-700 flex items-center">
                  Ver todas <ArrowRight size={16} className="ml-1" />
                </button>
              </Link>
            </div>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="text-green-600" size={20} />
                      ) : (
                        <ArrowDownRight className="text-red-600" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Cuentas de la Empresa</h2>
              <button className="text-indigo-600 hover:text-indigo-700 flex items-center">
                Ver todas <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {accounts
                .filter((account) => account.type !== "Prestamos")
                .slice(0, 4) // Limitar el número de cuentas mostradas
                .map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-indigo-100">
                        {account.type === "Dinero en Efectivo" ? (
                          <WalletOutlined className="text-3xl text-indigo-500" />
                        ) : (
                          <BankOutlined className="text-3xl text-indigo-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{account.name}</p>
                        <p className="text-sm text-gray-500">{account.type}</p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-800">
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;