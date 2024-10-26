import React from "react";
import { Button } from "antd";
import { format as formatDate } from "date-fns";
import { FaTrashAlt, FaUserEdit } from "react-icons/fa";
import { PlusCircle } from "lucide-react";

const TransactionTable = ({
    entries,
    categories = [],  // Predeterminado a un array vacío
    accounts = [],    // Predeterminado a un array vacío
    onDelete,
    onEdit,
    onOpenContentModal,
    onOpenModal,
}) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Categoría no encontrada";
    };

    const getAccountName = (accountId) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account ? account.name : "Cuenta no encontrada";
    };

    return (
        <div className="overflow-auto max-h-[40vh]">
            <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuenta</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impuestos</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comprobante</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {entries.map((entry, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                {formatDate(new Date(entry.date), "d MMM yyyy")}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                                <div className="text-xs font-medium text-gray-900">
                                    {entry.description}
                                </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                {entry.entryType === "transfer"
                                    ? `${getAccountName(entry.from_account_id)} ➡️ ${getAccountName(entry.to_account_id)}`
                                    : getAccountName(entry.account_id)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                {getCategoryName(entry.category_id) || "Sin categoría"}
                            </td>
                            <td className={`px-4 py-2 whitespace-nowrap text-xs font-medium ${entry.type === "expense" ? "text-red-600" : "text-blue-600"}`}>
                                {entry.type === "expense" ? "-" : "+"}
                                {formatCurrency(entry.amount)}
                            </td>
                            <td className="px-4 py-2">
                                {entry.tax_type === "IVA" ? (
                                    <>
                                        <p>IVA</p>
                                        <p className="text-green-600 font-medium">
                                            {formatCurrency(entry.amount * 0.19)}
                                        </p>
                                    </>
                                ) : (
                                    "No aplica"
                                )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-xs">
                                {entry.note ? (
                                    <button className="text-blue-500 hover:text-blue-600" onClick={() => onOpenContentModal(entry.note)}>
                                        Ver contenido
                                    </button>
                                ) : (
                                    "No hay contenido"
                                )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                                <Button
                                    className="mr-1"
                                    icon={<FaTrashAlt />}
                                    onClick={() => onDelete(entry)}
                                    danger
                                    size="small"
                                />
                                <Button
                                    onClick={() => onEdit(entry)}
                                    icon={<FaUserEdit />}
                                    type="primary"
                                    size="small"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={onOpenModal} className="fixed bottom-11 right-11 bg-[#FE6256] hover:bg-[#FFA38E] text-white rounded-full p-3 shadow-lg transition-colors duration-300">
                <PlusCircle size={30} />
            </button>
        </div>
    );
}

export default TransactionTable;
