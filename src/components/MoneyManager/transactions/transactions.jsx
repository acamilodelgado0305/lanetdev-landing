import React, { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { format as formatDate, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import axios from "axios";
import { Modal, message, Input, Select, Button, Card, Row, Col, Statistic, Typography } from "antd";
import AddEntryModal from "./addModal";
import AddIncome from "./Add/Income/AddIncome";
import AddExpense from "./Add/expense/AddExpense";
import {
  getAccounts,
  getCategories,
  deleteTransaction,
  deleteTransfer
} from "../../../services/moneymanager/moneyService";
import VoucherContentModal from "./ViewImageModal";
import TransactionTable from "./components/TransactionTable";
import ExpenseTable from "./components/ExpenseTable";
import IncomeTable from "./components/IncomeTable";
import { useAuth } from '../../Context/AuthProvider';
import Header from "./components/Header";
import {
  TrendingUp,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowLeftRight,
  Search,
  Plus,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FileTextOutlined, DollarOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;


const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

const formatCurrency = (amount) => {
  if (isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};




const DynamicButton = ({ icon: Icon, onClick, children, type = "default" }) => {
  const getColorScheme = () => {
    switch (type) {
      case "income":
        return "hover:bg-green-600 bg-green-500";
      case "expense":
        return "hover:bg-red-600 bg-red-500";
      case "transfer":
        return "hover:bg-[#0052CC] bg-[#0052CC]";
      default:
        return "hover:bg-gray-600 bg-gray-500";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2
        px-4 py-2.5
        text-white
        rounded
        shadow-sm
        transition-all duration-200
        ${getColorScheme()}
        hover:shadow-md
        active:transform active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="font-medium">{children}</span>
    </button>
  );
};

const TransactionsDashboard = () => {
  const navigate = useNavigate();
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedVoucherContent, setSelectedVoucherContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  const [isPlusModalOpen, setIsPlusModalOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0 });
  const createButtonRef = useRef(null);
  const [transactionType, setTransactionType] = useState(null);
  const [error, setError] = useState(null);
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [categories, setCategories] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState("/incomes");
  const { userRole } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [monthlyBalance, setMonthlyBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);

  

  const openModal = () => {
    setEditTransaction(null);
    setIsModalOpen(true);
  };

  const handleNavigate = () => {
    navigate('/index/moneymanager/transactions/nuevoingreso'); // Reemplaza '/nueva-ruta' con la ruta deseada
  };

  const handleNavigateExpense = () => {
    navigate('/index/moneymanager/transactions/nuevoegreso'); // Reemplaza '/nueva-ruta' con la ruta deseada
  };

  const openContentModal = (voucherContent) => {
    setSelectedVoucherContent(voucherContent);
    setIsContentModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditTransaction(entry);
    setIsModalOpen(true);
  };

  const closeContentModal = () => {
    setIsContentModalOpen(false);
    setSelectedVoucherContent("");
  };

  const openIncomeModal = () => {
    setIsIncomeModalOpen(true);
    setEditTransaction(null);
  };


  const openPlusModal = () => {
    if (createButtonRef.current) {
      const rect = createButtonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsPlusModalOpen(true);
  };

  const openTransferModal = () => {
    setTransactionType('transfer');
    setIsModalOpen(true);
    setEditTransaction(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTransactionType(null);
  };




  const closePlusModal = () => {
    setIsPlusModalOpen(false);
  };



  // Consolidar la función para cargar datos de acuerdo con el endpoint
  const fetchData = async (endpoint) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      const sortedEntries = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(sortedEntries);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error al cargar los datos");
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Error al obtener las cuentas:", error);
    }
  };

  const fetchMonthlyDatax = async () => {
    const monthYear = formatDate(currentMonth, "yyyy-MM");
    try {
      const response = await axios.get(`${API_BASE_URL}/balance/month/${monthYear}`);

      // Verificar la respuesta
      console.log('Balance Mensual Response:', response);

      // Extraer los datos correctamente
      const { total_incomes, total_expenses, net_balance } = response.data;

      // Convertir a número y manejar posibles valores nulos
      const balanceValue = parseFloat(net_balance) || 0;
      const incomeValue = parseFloat(total_incomes) || 0;
      const expensesValue = parseFloat(total_expenses) || 0;

      // Actualizar estados
      setMonthlyBalance(balanceValue);
      setMonthlyIncome(incomeValue);
      setMonthlyExpenses(expensesValue);
    } catch (err) {
      setError("Error al cargar los datos mensuales");
      console.error("Error fetching monthly data:", err.response ? err.response.data : err.message);
    }
  };

  // Llamar la función cuando cambie el mes seleccionado
  useEffect(() => {
    fetchMonthlyDatax();
  }, [currentMonth]);



  const fetchMonthlyData = async () => {
    try {
      // Realizar la solicitud a la nueva ruta
      const response = await axios.get(`${API_BASE_URL}/balance/general`);

      // Extraer los datos de la respuesta
      const { total_incomes, total_expenses, net_balance } = response.data;

      // Asignar los valores a las variables correspondientes
      const balanceValue = parseFloat(net_balance) || 0;
      const incomeValue = parseFloat(total_incomes) || 0;
      const expensesValue = parseFloat(total_expenses) || 0;

      // Actualizar los estados con los valores obtenidos
      setBalance(balanceValue);
      setTotalIncome(incomeValue);
      setTotalExpenses(expensesValue);
    } catch (err) {
      // Manejo de errores
      setError("Error al cargar los datos generales");
      console.error("Error fetching general balance data:", err);
    }
  };

  const handleEntryAdded = () => {
    fetchData(selectedEndpoint); // Usa el endpoint actual para refrescar los datos
    fetchMonthlyData();
  };


  //carga de los datos 
  useEffect(() => {
    fetchCategories();
    fetchAccounts();
    fetchMonthlyData();
    fetchData(selectedEndpoint);
  }, [selectedEndpoint, refreshTrigger]);




  const applyFilters = (entriesToFilter = entries) => {
    let filtered = entriesToFilter;

    if (!isSearching) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate >= startOfMonth(currentMonth) &&
          entryDate <= endOfMonth(currentMonth)
        );
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.voucher && entry.voucher.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.category && entry.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((entry) =>
        filterType === "transfer"
          ? entry.entryType === "transfer"
          : entry.type === filterType
      );
    }

    setFilteredEntries(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, entries, currentMonth, isSearching]);

  const handleDelete = async (entry) => {
    Modal.confirm({
      title: `¿Está seguro de que desea eliminar esta ${entry.entryType === "transfer" ? "transferencia" : "transacción"}?`,
      content: "Esta acción no se puede deshacer.",
      onOk: async () => {
        try {
          if (entry.entryType === "transfer") {
            await deleteTransfer(entry.id);
          } else {
            await deleteTransaction(entry.id);
          }
          setEntries(entries.filter((e) => e.id !== entry.id));
          message.success(`${entry.entryType === "transfer" ? "Transferencia" : "Transacción"} eliminada con éxito`);
          fetchMonthlyData();
        } catch (error) {
          console.error(`Error al eliminar la ${entry.entryType === "transfer" ? "transferencia" : "transacción"}:`, error);
          message.error(`Error al eliminar la ${entry.entryType === "transfer" ? "transferencia" : "transacción"}`);
        }
      },
    });
  };

  // Paginación
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const paginatedEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getMonthsArray = () => {
    const months = [];
    for (let i = -2; i <= 2; i++) {
      const date = addMonths(currentMonth, i);
      months.push(date);
    }
    return months;
  };

  // Maneja el clic de navegación y establece el endpoint seleccionado
  const handleNavClick = (endpoint) => {
    setSelectedEndpoint(endpoint); // Actualiza el endpoint seleccionado
    fetchData(endpoint); // Carga los datos de acuerdo al nuevo endpoint
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Barra superior de herramientas */}
      <div className="bg-gray border-b sticky top-0 z-0 shadow-sm">
        {/* Sección superior con botones de acción */}
        <div className="max-full mx-auto pt-4 pl-4 pr-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                <div className="bg-[#007072] p-2 ">
                  <FileTextOutlined className=" text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#007072] text-sm">Finanzas /</span>
                  <Title level={3} className="">
                    Dashboard
                  </Title>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <DynamicButton
                icon={TrendingUp}
                onClick={handleNavigate}
                type="income"
              >
                Nuevo Ingreso
              </DynamicButton>

              <DynamicButton
                icon={CreditCard}
                onClick={handleNavigateExpense}
                type="expense"
              >
                Nuevo Egreso
              </DynamicButton>

              <DynamicButton
                icon={ArrowLeftRight}
                onClick={openTransferModal}
                type="transfer"
              >
                Nueva Transferencia
              </DynamicButton>
            
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="p-4">
          <Row gutter={[16, 16]}>
            {userRole === "superadmin" && (
              <>
                <Col xs={24} md={8}>
                  <Card bordered={false} className="h-full">
                    <Title level={5} className="text-gray-500 mb-4">Balance</Title>
                    <Statistic
                      title="Balance Total"
                      value={balance}
                      precision={2}
                      prefix={<DollarOutlined />}
                      formatter={(value) => formatCurrency(value)}
                      className="mb-4"
                    />
                    <Statistic
                      title="Balance Mensual"
                      value={monthlyBalance}
                      precision={2}
                      prefix={<DollarOutlined />}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </Card>
                </Col>

                <Col xs={24} md={8}>
                  <Card bordered={false} className="h-full">
                    <Title level={5} className="text-gray-500 mb-4">Ingresos</Title>
                    <Statistic
                      title="Ingresos Totales"
                      value={totalIncome}
                      precision={2}
                      prefix={<ArrowUpOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                      formatter={(value) => formatCurrency(value)}
                      className="mb-4"
                    />
                    <Statistic
                      title="Ingresos Mensuales"
                      value={monthlyIncome}
                      precision={2}
                      prefix={<ArrowUpOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </Card>
                </Col>
              </>
            )}

            {(userRole === "admin" || userRole === "superadmin") && (
              <Col xs={24} md={8}>
                <Card bordered={false} className="h-full">
                  <Title level={5} className="text-gray-500 mb-4">Gastos</Title>
                  <Statistic
                    title="Gastos Totales"
                    value={totalExpenses}
                    precision={2}
                    prefix={<ArrowDownOutlined />}
                    valueStyle={{ color: '#cf1322' }}
                    formatter={(value) => formatCurrency(value)}
                    className="mb-4"
                  />
                  <Statistic
                    title="Gastos Mensuales"
                    value={monthlyExpenses}
                    precision={2}
                    prefix={<ArrowDownOutlined />}
                    valueStyle={{ color: '#cf1322' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                </Card>
              </Col>
            )}
          </Row>
        </div>
      </div>

      {/* Navegación entre categorías */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <Header onNavClick={handleNavClick} />
        </div>
      </div>
    </div>

      {/* Contenido principal */ }
  <div className="max-w-full py-4 mx-auto  ">
    <div className="bg-white  shadow-sm border">
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 450px)' }}>
        {error && (
          <div className="p-2 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {selectedEndpoint === "/incomes" && (
          <IncomeTable
            entries={paginatedEntries}
            categories={categories}
            accounts={accounts}
            onDelete={() => {
              fetchData(selectedEndpoint);
              fetchMonthlyData();
            }}
            onEdit={openEditModal}
            onOpenContentModal={openContentModal}
            onOpenModal={openModal}
          />
        )}

        {selectedEndpoint === "/expenses" && (
          <ExpenseTable
            entries={paginatedEntries}
            categories={categories}
            accounts={accounts}
            onDelete={() => {
              fetchData(selectedEndpoint);
              fetchMonthlyData();
            }}
            onEdit={openEditModal}
            onOpenContentModal={openContentModal}
            onOpenModal={openModal}
          />
        )}

        {selectedEndpoint === "/transfers" && (
          <TransactionTable
            entries={paginatedEntries}
            categories={categories}
            accounts={accounts}
            onDelete={() => {
              fetchData(selectedEndpoint);
              fetchMonthlyData();
            }}
            onEdit={openEditModal}
            onOpenContentModal={openContentModal}
            onOpenModal={openModal}
          />
        )}
      </div>
    </div>
  </div>

  {/* Navegación de meses */ }
  <div className="fixed bottom-0 w-full bg-white border-t shadow-md">
    <div className="max-w-7xl mx-auto px-6 py-2">
      <div className="flex items-center justify-center space-x-4">
        <Button
          type="text"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={handlePreviousMonth}
          className="hover:bg-gray-100"
        />

        <div className="flex overflow-x-auto space-x-2 px-2">
          {getMonthsArray().map((date) => {
            const isCurrentMonth = formatDate(date, "yyyy-MM") === formatDate(currentMonth, "yyyy-MM");
            return (
              <button
                key={date.getTime()}
                onClick={() => setCurrentMonth(date)}
                className={`
                      px-4 py-2 text-sm font-medium transition-all
                      ${isCurrentMonth
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-50"
                  }
                    `}
              >
                {formatDate(date, "MMMM yyyy")}
              </button>
            );
          })}
        </div>

        <Button
          type="text"
          icon={<ChevronRight className="w-4 h-4" />}
          onClick={handleNextMonth}
          className="hover:bg-gray-100"
        />
      </div>
    </div>
  </div>

  {/* Modales */ }
      <AddEntryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onTransactionAdded={handleEntryAdded}
        transactionToEdit={editTransaction}
        transactionType={transactionType}
      />
      <VoucherContentModal
        isOpen={isContentModalOpen}
        onClose={closeContentModal}
        voucherContent={selectedVoucherContent}
      />
    </div >
  );
};

export default TransactionsDashboard;
