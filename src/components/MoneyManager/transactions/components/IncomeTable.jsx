import React, { useState } from 'react';
import { Button, Tooltip, Dropdown, Menu } from 'antd';
import { format as formatDate } from 'date-fns';
import {
    DeleteOutlined,
    EditOutlined,
    FileTextOutlined,
    FilterOutlined,
    CaretDownOutlined
} from '@ant-design/icons';
import _ from 'lodash';

const IncomeTable = ({
    entries,
    categories = [],
    accounts = [],
    onDelete,
    onEdit,
    onOpenContentModal,
}) => {
    const [columnFilters, setColumnFilters] = useState({});
    const [hoveredRow, setHoveredRow] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Sin categoría";
    };

    const getAccountName = (accountId) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account ? account.name : "Cuenta no encontrada";
    };

    // Obtener valores únicos para los filtros
    const getUniqueValues = (field) => {
        return _.uniq(entries.map(entry => {
            if (field === 'category') return getCategoryName(entry.category_id);
            if (field === 'account') return getAccountName(entry.account_id);
            return entry[field];
        })).filter(Boolean);
    };

    const getFilterMenu = (field) => (
        <Menu
            items={getUniqueValues(field).map(value => ({
                key: value,
                label: (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={columnFilters[field]?.includes(value)}
                            onChange={(e) => {
                                let newFilters = { ...columnFilters };
                                if (!newFilters[field]) newFilters[field] = [];
                                if (e.target.checked) {
                                    newFilters[field] = [...newFilters[field], value];
                                } else {
                                    newFilters[field] = newFilters[field].filter(v => v !== value);
                                }
                                if (newFilters[field].length === 0) delete newFilters[field];
                                setColumnFilters(newFilters);
                            }}
                        />
                        <span className="ml-2">{value}</span>
                    </div>
                ),
            }))}
        />
    );

    const columns = [
        { title: 'Fecha', field: 'date', width: '100px' },
        { title: 'Descripción', field: 'description', width: '200px' },
        { title: 'Cuenta', field: 'account', width: '150px' },
        { title: 'Categoría', field: 'category', width: '150px' },
        { title: 'Monto Total', field: 'amount', width: '120px' },
        { title: 'Monto FEV', field: 'amountfev', width: '120px' },  // Nueva columna
        { title: 'Monto Diverse', field: 'amountdiverse', width: '120px' }, // Nueva columna
        { title: 'Tipo', field: 'type', width: '100px' }, // Nueva columna
        { title: 'Comprobante', field: 'note', width: '120px' },
        { title: 'Acciones', field: 'actions', width: '100px' },
    ];

    return (
        <div className=" overflow-auto h-[39em]">
            <table className="w-full relative table-fixed border-collapse">
                <thead className="sticky top-0 z-5 bg-white">
                    <tr className="border-b border-gray-200">
                        {columns.map((column) => (
                            <th
                                key={column.field}
                                style={{ width: column.width }}
                                className="border-r border-gray-200 bg-gray-50 p-0"
                            >
                                <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-xs font-medium text-gray-500">
                                        {column.title}
                                    </span>
                                    {column.field !== 'actions' && (
                                        <Dropdown
                                            overlay={getFilterMenu(column.field)}
                                            trigger={['click']}
                                        >
                                            <Button
                                                type="text"
                                                size="small"
                                                className={`flex items-center ${columnFilters[column.field]?.length ? 'text-blue-600' : 'text-gray-400'
                                                    }`}
                                                icon={<FilterOutlined />}
                                            >
                                                <CaretDownOutlined style={{ fontSize: '10px' }} />
                                            </Button>
                                        </Dropdown>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {entries.filter(entry => {
                        return Object.entries(columnFilters).every(([field, values]) => {
                            let cellValue;
                            switch (field) {
                                case 'category':
                                    cellValue = getCategoryName(entry.category_id);
                                    break;
                                case 'account':
                                    cellValue = getAccountName(entry.account_id);
                                    break;
                                default:
                                    cellValue = entry[field];
                            }
                            return values.includes(cellValue);
                        });
                    }).map((entry, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={`border-b hover:bg-gray-50 ${hoveredRow === rowIndex ? 'bg-gray-50' : ''
                                }`}
                            onMouseEnter={() => setHoveredRow(rowIndex)}
                            onMouseLeave={() => setHoveredRow(null)}
                        >
                            <td className="border-r border-gray-200 p-2 truncate">
                                {formatDate(new Date(entry.date), "d MMM yyyy")}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate">
                                {entry.description}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate">
                                {getAccountName(entry.account_id)}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate">
                                {getCategoryName(entry.category_id)}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate font-medium text-green-600">
                                +{formatCurrency(entry.amount)}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate text-blue-600">
                                +{formatCurrency(entry.amountfev)} {/* Mostrar amountfev */}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate text-blue-600">
                                +{formatCurrency(entry.amountdiverse)} {/* Mostrar amountdiverse */}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate">
                                {entry.type}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate">
                                {entry.note ? (
                                    <Button
                                        type="link"
                                        size="small"
                                        onClick={() => onOpenContentModal(entry.note)}
                                        icon={<FileTextOutlined />}
                                    >
                                        Ver
                                    </Button>
                                ) : (
                                    "—"
                                )}
                            </td>
                            <td className="p-2 text-center">
                                <div className="flex justify-center space-x-1">
                                    <Tooltip title="Eliminar">
                                        <Button
                                            type="text"
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => onDelete(entry)}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Editar">
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<EditOutlined />}
                                            onClick={() => onEdit(entry)}
                                        />
                                    </Tooltip>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default IncomeTable;
