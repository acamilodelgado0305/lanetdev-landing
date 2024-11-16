import React from "react";
import { Button } from "antd";
import {
    CloseOutlined,
    EditOutlined,
    DeleteOutlined,
    FileTextOutlined,
    PrinterOutlined,
} from "@ant-design/icons";

const TransactionDetailModal = ({ isOpen, onClose, entry, getCategoryName, getAccountName, formatCurrency }) => {
    if (!isOpen || !entry) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[32em] bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto">
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <FileTextOutlined className="text-blue-500 text-xl" />
                        </div>
                        <h2 className="text-xl font-semibold">Detalle del Ingreso</h2>
                    </div>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClose}
                        className="hover:bg-gray-100 rounded-full"
                    />
                </div>
                <hr className="border-t-2 border-blue-500 mb-4" />

                {/* Información principal */}
                <h3 className="text-lg font-semibold">{entry.description}</h3>
                <p className="text-sm text-gray-500">Transacción #{entry.id}</p>

                {/* Detalles del ingreso */}
                <div className="bg-gray-50 p-4 rounded-lg my-4">
                    <p className="text-xl font-bold text-gray-800">
                        {formatCurrency(entry.amount)}
                        <span className="ml-2 px-2 py-1 text-sm text-blue-600 bg-blue-100 rounded">
                            {entry.status || "Pendiente"}
                        </span>
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p className="text-sm text-gray-500">Fecha y hora</p>
                            <p className="font-medium">{new Date(entry.date).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Método de pago</p>
                            <p className="font-medium">{entry.paymentMethod || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Categoría</p>
                            <p className="font-medium">{getCategoryName(entry.category_id)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Cuenta</p>
                            <p className="font-medium">{getAccountName(entry.account_id)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Monto FEV</p>
                            <p className="font-medium text-green-600">
                                {formatCurrency(entry.amountfev || 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Monto Diverse</p>
                            <p className="font-medium text-green-600">
                                {formatCurrency(entry.amountdiverse || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Resumen adicional */}
                <h4 className="text-lg font-semibold">Detalles adicionales</h4>
                <p className="mt-2 text-sm text-gray-500">
                    Tipo de ingreso: <span className="font-medium">{entry.type || "N/A"}</span>
                </p>
                {entry.note && (
                    <p className="mt-2 text-sm text-gray-500">
                        Nota: <span className="font-medium">{entry.note}</span>
                    </p>
                )}

                {/* Botones inferiores */}
                <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t flex justify-around">
                    <Button
                        icon={<PrinterOutlined />}
                        className="flex items-center justify-center w-24"
                    >
                        Imprimir
                    </Button>
                    <Button
                        icon={<FileTextOutlined />}
                        className="flex items-center justify-center w-24"
                    >
                        Comprobante
                    </Button>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        className="flex items-center justify-center w-24"
                    >
                        Editar
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        className="flex items-center justify-center w-24"
                    >
                        Eliminar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailModal;
