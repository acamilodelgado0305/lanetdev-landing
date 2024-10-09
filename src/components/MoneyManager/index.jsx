import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Modal, Button } from "antd";
import { CreditCard, BarChart2, Send, MoreHorizontal, User, DollarSign, CheckSquare, Check, ChevronDown, ChevronUp } from "lucide-react";
import { CiSettings } from "react-icons/ci";
import { getTransactions } from "../../services/moneymanager/moneyService";
import AddEntryModal from "../MoneyManager/transactions/addModal";

// NavLink component
const NavLink = ({ to, icon: Icon, children }) => (
  <Link
    to={to}
    className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
  >
    <Icon className="w-5 h-5 mr-2 text-gray-500" />
    <span>{children}</span>
  </Link>
);

const IndexMoneyManager = () => {
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPaymentsModalVisible, setIsPaymentsModalVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState(null);
  const [completedPayments, setCompletedPayments] = useState({});
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);


  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const transactions = await getTransactions();
      const processedEvents = processRecurringTransactions(transactions);
      setEvents(processedEvents);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

  const processRecurringTransactions = (transactions) => {
    const processedEvents = {};
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();


    transactions.forEach((transaction) => {
      if (transaction.recurrent) {
        const date = new Date(transaction.date);

        // Start from next month
        for (let i = 1; i <= 12; i++) {
          const nextDate = new Date(
            currentYear,
            currentMonth + i,
            date.getDate()
          );
          const formattedDate = nextDate.toISOString().split("T")[0];

          if (!processedEvents[formattedDate]) {
            processedEvents[formattedDate] = [];
          }

          processedEvents[formattedDate].push({
            type: transaction.type === "income" ? "success" : "error",
            content: transaction.description,
            amount: transaction.amount,
            description: transaction.description,
            paid: transaction.paid,
            date: formattedDate, // Add the date to the event
          });
        }
      }
    });

    return processedEvents;
  };


  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleTaskToggle = (event, isCompleted) => {
    if (isCompleted) {
      // If it's completed, move it back to pending
      setCompletedPayments(prev => {
        const newCompletedPayments = { ...prev };
        delete newCompletedPayments[event.content];
        return newCompletedPayments;
      });
      setCompletedTasks(prev => prev.filter(task => task.content !== event.content));
    } else {
      // If it's pending, move it to completed
      setCompletedPayments(prev => ({
        ...prev,
        [event.content]: true
      }));
      setCompletedTasks(prev => [...prev, event]);
    }
  };

  const getNextMonthRecurringTransactions = () => {
    const currentDate = new Date();
    const nextMonth = (currentDate.getMonth() + 1) % 12;
    const nextMonthYear = currentDate.getFullYear() + (nextMonth === 0 ? 1 : 0);

    return Object.entries(events).reduce((acc, [date, dayEvents]) => {
      const eventDate = new Date(date);
      if (
        eventDate.getMonth() === nextMonth &&
        eventDate.getFullYear() === nextMonthYear
      ) {
        return [...acc, ...dayEvents.filter((event) => !event.paid)];
      }
      return acc;
    }, []);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };


  const renderPaymentsList = () => {
    const nextMonthEvents = getNextMonthRecurringTransactions();
    const pendingTasks = nextMonthEvents.filter(event => !completedPayments[event.content]);

    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CheckSquare className="w-5 h-5 mr-2 text-blue-500" />
          Pagos Pendientes (Próximo mes)
        </h3>
        {pendingTasks.length > 0 ? (
          <ul className="space-y-4">
            {pendingTasks.map((event, index) => (
              <li key={index} className="flex items-center space-x-2 justify-between p-2 rounded-lg">
                <div className="flex items-center space-x-3 flex-grow">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer"
                    onClick={() => handleTaskToggle(event, false)}
                  >
                    {completedPayments[event.content] && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`flex flex-col ${completedPayments[event.content] ? 'line-through text-gray-500' : ''}`}>
                    <span className="font-medium">{event.content}</span>
                    <span className="text-sm text-gray-600">{formatCurrency(event.amount)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500">
                    {formatDate(event.date)}
                  </span>
                  <span className="text-xs text-gray-400">
                    (Mensual)
                  </span>
                  <Button
                    type="primary"
                    onClick={() => handlePayment(event)}
                    className="mt-1"
                  >
                    Pagar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay pagos pendientes para el próximo mes</p>
        )}
        <div className="mt-6">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
          >
            <h4 className="text-md font-semibold flex items-center">
              Completadas ({completedTasks.length})
              {isCompletedExpanded ? <ChevronUp className="ml-2" size={16} /> : <ChevronDown className="ml-2" size={16} />}
            </h4>
          </div>

          
          {isCompletedExpanded && (
            <ul className="space-y-2 mt-2">
              {completedTasks.map((task, index) => (
                <li key={index} className="flex items-center space-x-2 text-gray-500 line-through">
                  <div
                    className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center cursor-pointer"
                    onClick={() => handleTaskToggle(task, true)}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span>{task.content}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  const handlePayment = (payment) => {
    setPaymentToEdit({
      amount: payment.amount
        ? formatCurrency(payment.amount) // Formatear el valor antes de pasarlo al modal
        : "", // Pasa el monto formateado
      description: payment.description || "", // Pasa la descripción
      type: "expense", // Configura como gasto
      isEditing: false, // Nos aseguramos de que es una nueva transacción, no edición
    });
    setIsPaymentsModalVisible(false); // Cierra el modal de "Pagos Pendientes"
    setIsModalOpen(true); // Abre el modal de nueva transacción
  };

  const handleEntryAdded = (newTransaction) => {
    console.log("Transacción añadida:", newTransaction);
    fetchTransactions();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    navigate("/index/moneymanager/transactions");
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-sm w-full">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-800">
                Money Manager
              </span>
            </div>
          </div>
          <nav className="flex items-center justify-center hidden md:flex space-x-4">
            <NavLink to="/index/moneymanager/transactions" icon={Send}>
              Transacciones
            </NavLink>
            <button
              onClick={() => setIsPaymentsModalVisible(true)}
              className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              <CheckSquare className="w-5 h-5 mr-2 text-gray-500" />
              <span>Pagos Pendientes</span>
            </button>
            <NavLink to="/index/moneymanager/accounts" icon={DollarSign}>
              Cuentas
            </NavLink>
            <NavLink to="/index/moneymanager/calendario" icon={CreditCard}>
              Calendario
            </NavLink>
            <NavLink to="/index/moneymanager/estadisticas" icon={BarChart2}>
              Estadísticas
            </NavLink>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                <MoreHorizontal className="w-5 h-5 mr-2 text-gray-500" />
                <span>Más</span>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <NavLink to="/index/moneymanager/categorias" icon={User}>
                    Categorias
                  </NavLink>
                  <NavLink to="/index/moneymanager/option2" icon={CiSettings}>
                    Configuración
                  </NavLink>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-gray-100 w-full">
        <div className="w-full py-4">
          <Outlet />
        </div>
      </main>

      <Modal
        title="Pagos Pendientes"
        visible={isPaymentsModalVisible}
        onOk={() => setIsPaymentsModalVisible(false)}
        onCancel={() => setIsPaymentsModalVisible(false)}
        footer={null}
      >
        {renderPaymentsList()}
      </Modal>

      <AddEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTransactionAdded={handleEntryAdded}
        transactionToEdit={paymentToEdit}
      />
    </div>
  );
};

export default IndexMoneyManager;
