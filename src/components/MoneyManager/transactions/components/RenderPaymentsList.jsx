import React, { useState, useEffect } from "react";
import { Button, Modal, Input, Pagination } from "antd";
import { CheckSquare } from "lucide-react";
import { getPendingTransactions } from "../../../../services/moneymanager/moneyService";

const RenderPaymentsList = () => {
    const [showRecurrentPayments, setShowRecurrentPayments] = useState(true);
    const [showPendingPayments, setShowPendingPayments] = useState(false);
    const [isAddPendingModalVisible, setIsAddPendingModalVisible] = useState(false);
    const [newPayment, setNewPayment] = useState({ content: '', amount: 0 });
    const [recurrentPayments, setRecurrentPayments] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
    const [pageSize] = useState(5); // Tamaño de la página (elementos por página)

    // Llamada a la API para obtener transacciones
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const transactions = await getPendingTransactions();
                // Separar las transacciones recurrentes de las pendientes
                const recPayments = transactions.filter(tx => tx.recurrent);
                const penPayments = transactions.filter(tx => !tx.recurrent);
                setRecurrentPayments(recPayments);
                setPendingPayments(penPayments);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const handleAddPendingPayment = () => {
        console.log('Agregando nuevo pago pendiente:', newPayment);
        setNewPayment({ content: '', amount: 0 });
        setIsAddPendingModalVisible(false);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Lógica para paginación de los datos
    const getPaginatedData = (data) => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return data.slice(startIndex, endIndex);
    };

    if (loading) {
        return <p>Cargando transacciones...</p>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mx-20">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CheckSquare className="w-5 h-5 mr-2 text-blue-500" />
                Gestión de Pagos
            </h3>

            {/* Botones para alternar entre pagos recurrentes y pagos pendientes */}
            <div className="mb-4">
                <Button
                    type={showRecurrentPayments ? "primary" : "default"}
                    onClick={() => {
                        setShowRecurrentPayments(true);
                        setShowPendingPayments(false);
                        setCurrentPage(1); // Reiniciar paginación al cambiar de vista
                    }}
                    className="mr-2"
                >
                    Ver Pagos Recurrentes
                </Button>
                <Button
                    type={showPendingPayments ? "primary" : "default"}
                    onClick={() => {
                        setShowPendingPayments(true);
                        setShowRecurrentPayments(false);
                        setCurrentPage(1); // Reiniciar paginación al cambiar de vista
                    }}
                >
                    Ver Pagos Pendientes
                </Button>

                {/* Botón para agregar un nuevo pago pendiente */}
                <Button
                    type="dashed"
                    onClick={() => setIsAddPendingModalVisible(true)}
                    className="ml-4"
                >
                    Agregar Nuevo Pago Pendiente
                </Button>
            </div>

            {/* Mostrar Pagos Recurrentes */}
            {showRecurrentPayments && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Pagos Recurrentes</h3>
                    {recurrentPayments.length > 0 ? (
                        <>
                            <ul className="space-y-4">
                                {getPaginatedData(recurrentPayments).map((payment, index) => (
                                    <li key={index} className="flex items-center space-x-2 justify-between p-2 rounded-lg">
                                        <div className="flex items-center space-x-3 flex-grow">
                                            <span className="font-medium">{payment.description}</span>
                                            <span className="text-sm text-gray-600">{payment.amount}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm text-gray-500">{payment.date}</span>
                                            <Button
                                                type="primary"
                                                onClick={() => console.log('Pagar', payment)}
                                                className="mt-1"
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
                </div>
            )}

            {/* Mostrar Pagos Pendientes */}
            {showPendingPayments && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Pagos Pendientes</h3>
                    {pendingPayments.length > 0 ? (
                        <>
                            <ul className="space-y-4">
                                {getPaginatedData(pendingPayments).map((payment, index) => (
                                    <li key={index} className="flex items-center space-x-2 justify-between p-2 rounded-lg">
                                        <div className="flex items-center space-x-3 flex-grow">
                                            <span className="font-medium">{payment.description}</span>
                                            <span className="text-sm text-gray-600">{payment.amount}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <Button
                                                type="primary"
                                                onClick={() => console.log('Pagar', payment)}
                                                className="mt-1"
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
                                total={pendingPayments.length}
                                onChange={handlePageChange}
                                className="mt-4"
                            />
                        </>
                    ) : (
                        <p className="text-gray-500">No hay pagos pendientes.</p>
                    )}
                </div>
            )}

            {/* Modal para agregar nuevo pago pendiente */}
            <Modal
                title="Agregar Nuevo Pago Pendiente"
                visible={isAddPendingModalVisible}
                onOk={handleAddPendingPayment}
                onCancel={() => setIsAddPendingModalVisible(false)}
            >
                <div className="mb-4">
                    <label>Descripción del Pago</label>
                    <Input
                        value={newPayment.content}
                        onChange={(e) => setNewPayment({ ...newPayment, content: e.target.value })}
                        placeholder="Descripción del pago"
                    />
                </div>
                <div>
                    <label>Monto</label>
                    <Input
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
                        placeholder="Monto"
                        type="number"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default RenderPaymentsList;
