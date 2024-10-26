import React from "react";
import { ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import { format as formatDate } from "date-fns";

const TransactionFilters = ({
    currentMonth,
    searchTerm,
    filterType,
    onSearchChange,
    onFilterChange,
    onPrevMonth,
    onNextMonth,
}) => {
    return (
        <div>
            {/* Encabezado con controles de mes */}
            <div className="flex justify-between items-center mb-4">
                <button
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                    onClick={onPrevMonth}
                >
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold">
                    {formatDate(currentMonth, "MMMM yyyy")}
                </h2>
                <button
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                    onClick={onNextMonth}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Controles de búsqueda y filtro */}
            <div className="mb-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar transacciones..."
                        className="mx-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8 pr-2 py-1 text-sm"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <Search
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filterType}
                        onChange={(e) => onFilterChange(e.target.value)}
                    >
                        <option value="all">Todos</option>
                        <option value="income">Ingresos</option>
                        <option value="expense">Gastos</option>
                        <option value="transfer">Transferencias</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default TransactionFilters;
