import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { Card, Row, Col, Statistic, List, Typography } from 'antd';
import { getAccounts, getCategories, getTransactions, getTransfers } from '../../../services/moneymanager/moneyService.js'; // Adjust the import path as needed

const { Title } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Estadisticas = () => {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsData, categoriesData, transactionsData, transfersData] = await Promise.all([
          getAccounts(),
          getCategories(),
          getTransactions(),
          getTransfers()
        ]);
        setAccounts(accountsData);
        setCategories(categoriesData);
        setTransactions(transactionsData);
        setTransfers(transfersData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTotalBalance = () => accounts.reduce((sum, account) => sum + (Number(account.balance) || 0), 0);

  const getCategoryTotals = () => {
    const totals = {};
    transactions.forEach(transaction => {
      const amount = Number(transaction.amount) || 0;
      if (totals[transaction.category]) {
        totals[transaction.category] += amount;
      } else {
        totals[transaction.category] = amount;
      }
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyTransactions = () => {
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!acc[monthYear]) {
        acc[monthYear] = { month: monthYear, income: 0, expense: 0 };
      }
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === 'income') {
        acc[monthYear].income += amount;
      } else {
        acc[monthYear].expense += amount;
      }
      return acc;
    }, {});
    return Object.values(monthlyData);
  };

  const formatCurrency = (value) => {
    const num = Number(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card>
          <Statistic title="Total Balance" value={getTotalBalance()} prefix="$" precision={2} />
        </Card>
      </Col>

      <Col span={12}>
        <Card title="Account Balances">
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="balance" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      <Col span={12}>
        <Card title="Spending by Category">
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getCategoryTotals()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCategoryTotals().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      <Col span={24}>
        <Card title="Monthly Income vs Expenses">
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getMonthlyTransactions()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#82ca9d" />
                <Line type="monotone" dataKey="expense" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      <Col span={12}>
        <Card title="Recent Transactions">
          <List
            dataSource={transactions.slice(0, 5)}
            renderItem={(transaction) => (
              <List.Item
                key={transaction.id}
                extra={
                  <span style={{ color: transaction.type === 'income' ? 'green' : 'red' }}>
                    ${formatCurrency(transaction.amount)}
                  </span>
                }
              >
                <List.Item.Meta title={transaction.description} />
              </List.Item>
            )}
          />
        </Card>
      </Col>

      <Col span={12}>
        <Card title="Recent Transfers">
          <List
            dataSource={transfers.slice(0, 5)}
            renderItem={(transfer) => (
              <List.Item key={transfer.id} extra={`$${formatCurrency(transfer.amount)}`}>
                <List.Item.Meta 
                  title={`${transfer.fromAccount} → ${transfer.toAccount}`}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default Estadisticas;