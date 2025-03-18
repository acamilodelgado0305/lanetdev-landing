import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Tooltip,
} from "antd";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { getAccounts } from "../../../services/moneymanager/moneyService";

const Summary = ({ totalIncome, totalExpenses, balance }) => {
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

    if (totalIncome > 0 || totalExpenses > 0) {
      setMonthlyData([
        { name: "Enero", ingresos: totalIncome * 0.8, egresos: totalExpenses * 0.9 },
        { name: "Febrero", ingresos: totalIncome * 1.1, egresos: totalExpenses * 0.7 },
        { name: "Marzo", ingresos: totalIncome, egresos: totalExpenses },
      ]);
    }
  }, [totalIncome, totalExpenses]);

  const COLORS = ["#0052CC", "#00C7E6", "#36B37E", "#FF5630", "#6554C0", "#FFAB00"];

  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Row justify="space-between" align="middle">
            <Col>
             
            </Col>
            <Col>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Última actualización: {new Date().toLocaleDateString()}
                </span>
                <Tooltip title="Recargar datos financieros">
                  <Button
                    type="primary"
                    icon={<ArrowUpRight />}
                    onClick={fetchCuentas}
                    className="bg-[#0052CC] hover:bg-[#0047b3] transition-colors"
                  >
                    Actualizar
                  </Button>
                </Tooltip>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Row gutter={[16, 16]}>
          {/* Tarjeta de Ingresos */}
          <Col xs={24} md={8}>
            <Card
              bordered={false}
              className="shadow-md hover:shadow-lg transition-shadow"
              bodyStyle={{ padding: "16px" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-2 mr-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">Ingresos Totales</h3>
                </div>
                {cuentas.length > 0 && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {cuentas.filter((c) => c.plus).length} cuentas
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-sm text-gray-600 mb-4">Total de ingresos registrados</p>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={[{ name: "Total", valor: totalIncome }]}>
                  <Bar dataKey="valor" fill="#36B37E" barSize={20} animationDuration={1000} />
                  <ChartTooltip formatter={(value) => formatCurrency(value)} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Tarjeta de Egresos */}
          <Col xs={24} md={8}>
            <Card
              bordered={false}
              className="shadow-md hover:shadow-lg transition-shadow"
              bodyStyle={{ padding: "16px" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-red-100 p-2 mr-3">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">Egresos Totales</h3>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(totalExpenses)}
              </div>
              <p className="text-sm text-gray-600 mb-4">Total de egresos registrados</p>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={[{ name: "Total", valor: totalExpenses }]}>
                  <Bar dataKey="valor" fill="#FF5630" barSize={20} animationDuration={1000} />
                  <ChartTooltip formatter={(value) => formatCurrency(value)} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Tarjeta de Balance */}
          <Col xs={24} md={8}>
            <Card
              bordered={false}
              className="shadow-md hover:shadow-lg transition-shadow"
              bodyStyle={{ padding: "16px" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">Balance Total</h3>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(balance)}
              </div>
              <p className="text-sm text-gray-600 mb-4">Diferencia ingresos - egresos</p>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={[{ name: "Balance", ingresos: totalIncome, egresos: totalExpenses }]}>
                  <Bar dataKey="ingresos" fill="#36B37E" barSize={20} animationDuration={1000} />
                  <Bar dataKey="egresos" fill="#FF5630" barSize={20} animationDuration={1000} />
                  <ChartTooltip formatter={(value) => formatCurrency(value)} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Gráfico de Ingresos vs Egresos */}
          <Col xs={24} md={12}>
            <Card
              title={<h3 className="text-lg font-semibold text-gray-700">Ingresos vs Egresos</h3>}
              bordered={false}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Ingresos", value: totalIncome },
                      { name: "Egresos", value: totalExpenses },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    <Cell fill="#36B37E" />
                    <Cell fill="#FF5630" />
                  </Pie>
                  <ChartTooltip formatter={(value) => formatCurrency(value)} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ paddingLeft: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Resumen de Cuentas */}
          <Col xs={24} md={12}>
            <Card
              title={<h3 className="text-lg font-semibold text-gray-700">Resumen de Cuentas</h3>}
              bordered={false}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              {error && (
                <div className="p-4 text-red-500 bg-red-50 rounded-md">{error}</div>
              )}
              <div className="divide-y divide-gray-200">
                {cuentas.length > 0 ? (
                  cuentas
                    .filter((cuenta) => cuenta.type.toLowerCase() !== "prestamos") // Filtrar cuentas de tipo "prestamos"
                    .map((cuenta) => (
                      <div
                        key={cuenta.id}
                        className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="rounded-full bg-blue-100 p-2 mr-3">
                            {cuenta.type === "Banco" ? (
                              <CreditCard className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Briefcase className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-800">{cuenta.name}</h4>
                            <p className="text-xs text-gray-500">{cuenta.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-800">
                            {formatCurrency(parseFloat(cuenta.balance))}
                          </div>
                          <div
                            className={`text-xs ${
                              cuenta.plus ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {cuenta.plus ? "Activo" : "Pasivo"}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-4 text-gray-500">No hay cuentas disponibles</div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Summary;