import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Modal, Checkbox, Button } from "antd";
import { CreditCard, BarChart2, Send, MoreHorizontal, User, DollarSign, CheckSquare } from "lucide-react";
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

        for (let i = 0; i < 12; i++) {
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

  const handleCheckboxClick = (content) => {
    console.log(`Checkbox clicked for: ${content}`);
  };

  const getCurrentMonthRecurringTransactions = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return Object.entries(events).reduce((acc, [date, dayEvents]) => {
      const eventDate = new Date(date);
      if (
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      ) {
        return [...acc, ...dayEvents.filter((event) => !event.paid)];
      }
      return acc;
    }, []);
  };

  const renderPaymentsList = () => {
    const currentMonthEvents = getCurrentMonthRecurringTransactions();

    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CheckSquare className="w-5 h-5 mr-2 text-blue-500" />
          Pagos Pendientes
        </h3>
        {currentMonthEvents.length > 0 ? (
          <ul className="space-y-2">
            {currentMonthEvents.map((event, index) => (
              <li
                key={index}
                className="flex items-center space-x-2 justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    onChange={() => handleCheckboxClick(event.content)}
                    className="text-blue-500"
                  />
                  <span className="text-gray-700">
                    {event.content} - {formatCurrency(event.amount)}
                  </span>
                </div>
                <Button
                  type="primary"
                  onClick={() => handlePayment(event)} // Pasar los datos del pago seleccionado al modal
                >
                  Pagar
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No hay pagos pendientes este mes</p>
        )}
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
