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

    // Llamada a la API para obtener transacciones
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const transactions = await getPendingTransactions();
                // Filtrar solo los pagos recurrentes
                const recPayments = transactions.filter(tx => tx.recurrent);
                setRecurrentPayments(recPayments);
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

    // Formatear el monto (sin el símbolo de moneda)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    // Formatear la fecha en formato legible
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handlePaymentClick = (payment) => {

        setPaymentToEdit({
            amount: payment.amount,
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

    if (loading) {
        return <p>Cargando transacciones...</p>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mx-20">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CheckSquare className="w-5 h-5 mr-2 text-blue-500" />
                Pagos Recurrentes
            </h3>

            {recurrentPayments.length > 0 ? (
                <>
                    <ul className="space-y-4">
                        {getPaginatedData(recurrentPayments).map((payment, index) => (
                            <li
                                key={index}
                                className="bg-white rounded-lg shadow-lg p-4 flex items-center justify-between space-x-4 border border-gray-200"
                            >
                                {/* Sección de la descripción */}
                                <div className="flex-grow">
                                    <span className="block font-semibold text-lg text-gray-800">{payment.description}</span>
                                    <span className="block text-sm text-gray-500">Descripción del pago</span>
                                </div>

                                {/* Sección del monto */}
                                <div className="flex-shrink-0 text-right">
                                    <span className="block font-semibold text-xl text-red-500">
                                        {formatCurrency(payment.amount)}
                                    </span>
                                    <span className="block text-sm text-gray-500">Monto</span>
                                </div>

                                {/* Sección de la fecha */}
                                <div className="flex-shrink-0 text-right">
                                    <span className="block font-medium text-gray-700">
                                        {formatDate(payment.date)}
                                    </span>
                                    <span className="block text-sm text-gray-500">Fecha</span>
                                </div>

                                {/* Botón de acción */}
                                <div className="flex-shrink-0">
                                    <Button
                                        type="primary"
                                        onClick={() => handlePaymentClick(payment)}
                                    >
                                        Pagar
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {/* Paginación */}
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={recurrentPayments.length}
                        onChange={handlePageChange}
                        className="mt-4"
                    />
                </>
            ) : (
                <p className="text-gray-500">No hay pagos recurrentes.</p>
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
