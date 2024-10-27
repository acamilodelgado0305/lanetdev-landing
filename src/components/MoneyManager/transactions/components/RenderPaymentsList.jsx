import React, { useState, useEffect } from "react";
import { Button, Pagination } from "antd";
import { CheckSquare } from "lucide-react";
import { getPendingTransactions } from "../../../../services/moneymanager/moneyService";
import AddEntryModal from "../addModal";

const RenderPaymentsList = () => {
    const [recurrentPayments, setRecurrentPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentToEdit, setPaymentToEdit] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date()); // Mes actual

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const transactions = await getPendingTransactions();
                const recPayments = transactions.filter(tx => tx.recurrent);
                setRecurrentPayments(recPayments);
                console.log(recPayments)
                setLoading(false);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getPaginatedData = (data) => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return data.slice(startIndex, endIndex);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handlePaymentClick = (payment) => {
        // Convertir el monto a un número entero o eliminar decimales si es necesario
        const formattedAmount = parseInt(payment.amount); // O Math.floor(payment.amount)

        console.log("Datos capturados para el modal:", {
            amount: formattedAmount,
            description: payment.description,
            type: "expense",
            isEditing: false,
        });

        setPaymentToEdit({
            amount: formattedAmount,
            description: payment.description,
            type: "expense",
            isEditing: false,
        });
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setPaymentToEdit(null);
    };

    const handleEntryAdded = (newTransaction) => {
        console.log("Transacción añadida:", newTransaction);
        handleModalClose();
    };

    // Obtener solo los pagos del mes actual
    const filteredPayments = recurrentPayments.filter((payment) => {
        const paymentDate = new Date(payment.date);
        return (
            paymentDate.getMonth() === currentMonth.getMonth() &&
            paymentDate.getFullYear() === currentMonth.getFullYear()
        );
    });

    // Moverse entre meses
    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
    };

    const currentMonthLabel = currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    if (loading) {
        return <p>Cargando transacciones...</p>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                <CheckSquare className="w-5 h-5 mr-2 text-blue-500" />
                Pagos Recurrentes - {currentMonthLabel}
                <div>
                    <Button onClick={handlePrevMonth}>Mes anterior</Button>
                    <Button onClick={handleNextMonth} className="ml-2">Mes siguiente</Button>
                </div>
            </h3>

            {filteredPayments.length > 0 ? (
                <>
                    <div className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr] gap-4 border-b-2 py-2 bg-gray-100 font-semibold">
                        <div>#</div>
                        <div>Descripción</div>
                        <div>Monto</div>
                        <div>Fecha</div>
                        <div>Estado</div>
                        <div>Acciones</div>
                    </div>
                    {getPaginatedData(filteredPayments).map((payment) => (
                        <div
                            key={payment.id}
                            className="grid grid-cols-[50px_1fr_1fr_1fr_1fr_1fr] gap-4 py-2 border-b border-gray-200 items-center"
                        >
                            <div>{payment.id}</div> {/* Mostrar el ID en vez del número de lista */}
                            <div>{payment.description}</div>
                            <div className="text-red-500">{formatCurrency(payment.amount)}</div>
                            <div>{formatDate(payment.date)}</div>
                            <div className={payment.estado ? "text-green-600" : "text-red-600"}>
                                {payment.estado ? "Activo" : "Inactivo"}
                            </div>
                            <div>
                                <Button type="primary" onClick={() => handlePaymentClick(payment)}>
                                    Pagar
                                </Button>
                            </div>
                        </div>
                    ))}
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredPayments.length}
                        onChange={handlePageChange}
                        className="mt-4"
                    />
                </>
            ) : (
                <p className="text-gray-500">No hay pagos recurrentes para este mes.</p>
            )}

            <AddEntryModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onTransactionAdded={handleEntryAdded}
                transactionToEdit={paymentToEdit}
            />
        </div>
    );
};

export default RenderPaymentsList;
