// src/components/MoneyManager/IndexMoneyManager.jsx
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Modal } from "antd";
import { getTransactions } from "../../services/moneymanager/moneyService";
import AddEntryModal from "./transactions/addModal";
import Header from "./Header";

const IndexMoneyManager = () => {
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPaymentsModalVisible, setIsPaymentsModalVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState(null);
  const [completedPayments, setCompletedPayments] = useState({});
  const [completedTasks, setCompletedTasks] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    navigate("/index/moneymanager/estadisticas");
  }, [navigate]);

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
            date: formattedDate,
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

  const handleTaskToggle = (event, isCompleted) => {
    if (isCompleted) {
      setCompletedPayments(prev => {
        const newCompletedPayments = { ...prev };
        delete newCompletedPayments[event.content];
        return newCompletedPayments;
      });
      setCompletedTasks(prev => prev.filter(task => task.content !== event.content));
    } else {
      setCompletedPayments(prev => ({
        ...prev,
        [event.content]: true
      }));
      setCompletedTasks(prev => [...prev, event]);
    }
  };

  const handlePayment = (payment) => {
    setPaymentToEdit({
      amount: payment.amount ? formatCurrency(payment.amount) : "",
      description: payment.description || "",
      type: "expense",
      isEditing: false,
    });
    setIsPaymentsModalVisible(false);
    setIsModalOpen(true);
  };

  const handleEntryAdded = (newTransaction) => {
    console.log("Transacción añadida:", newTransaction);
    fetchTransactions();
  };

  return (
    <div className="flex flex-col bg-gray-100">
      <Header />

      <main className="flex-1 bg-gray-100 w-full">
        <div className="w-full h-auto">
          <Outlet />
        </div>
      </main>

      <Modal
        title="Pagos Pendientes"
        visible={isPaymentsModalVisible}
        onOk={() => setIsPaymentsModalVisible(false)}
        onCancel={() => setIsPaymentsModalVisible(false)}
        footer={null}
      />

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