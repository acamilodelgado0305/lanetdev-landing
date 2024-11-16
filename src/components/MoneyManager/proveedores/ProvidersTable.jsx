import React, { useState } from "react";
import { Button, Tooltip, Dropdown, Menu, Modal } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, FilterOutlined, CaretDownOutlined } from "@ant-design/icons";
import _ from "lodash";

const ProvidersTable = ({ providers, onDelete, onEdit, onView }) => {
    const [columnFilters, setColumnFilters] = useState({});
    const [hoveredRow, setHoveredRow] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const showDeleteModal = (provider) => {
        setSelectedProvider(provider);
        setIsDeleteModalVisible(true);
    };

    const handleDelete = () => {
        if (selectedProvider) {
            onDelete(selectedProvider);
        }
        setIsDeleteModalVisible(false);
    };

    // Obtener valores únicos para los filtros
    const getUniqueValues = (field) => {
        return _.uniq(providers.map((provider) => provider[field])).filter(Boolean);
    };

    const getFilterMenu = (field) => (
        <Menu
            items={getUniqueValues(field).map((value) => ({
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
                                    newFilters[field] = newFilters[field].filter((v) => v !== value);
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
        { title: "Tipo Identificación", field: "tipo_identificacion", width: "150px" },
        { title: "Número Identificación", field: "numero_identificacion", width: "180px" },
        { title: "Razón Social", field: "razon_social", width: "200px" },
        { title: "Nombre Comercial", field: "nombre_comercial", width: "200px" },
        { title: "Teléfono", field: "telefono", width: "150px" },
        { title: "Email", field: "email", width: "200px" },
        { title: "Acciones", field: "actions", width: "100px" },
    ];

    return (
        <>

            <div className="overflow-auto h-[39em]">
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
                                        <span className="text-xs font-medium text-gray-500">{column.title}</span>
                                        {column.field !== "actions" && (
                                            <Dropdown overlay={getFilterMenu(column.field)} trigger={["click"]}>
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    className={`flex items-center ${columnFilters[column.field]?.length ? "text-blue-600" : "text-gray-400"
                                                        }`}
                                                    icon={<FilterOutlined />}
                                                >
                                                    <CaretDownOutlined style={{ fontSize: "10px" }} />
                                                </Button>
                                            </Dropdown>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {providers
                            .filter((provider) => {
                                return Object.entries(columnFilters).every(([field, values]) =>
                                    values.includes(provider[field])
                                );
                            })
                            .map((provider, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={`border-b hover:bg-gray-50 ${hoveredRow === rowIndex ? "bg-gray-50" : ""
                                        }`}
                                    onMouseEnter={() => setHoveredRow(rowIndex)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td className="border-r border-gray-200 p-2 truncate">{provider.tipo_identificacion}</td>
                                    <td className="border-r border-gray-200 p-2 truncate">{provider.numero_identificacion}</td>
                                    <td className="border-r border-gray-200 p-2 truncate">{provider.razon_social}</td>
                                    <td className="border-r border-gray-200 p-2 truncate">{provider.nombre_comercial}</td>
                                    <td className="border-r border-gray-200 p-2 truncate">{provider.telefono}</td>
                                    <td className="border-r border-gray-200 p-2 truncate">{provider.email}</td>
                                    <td className="p-2 text-center">
                                        <div className="flex justify-center space-x-1">
                                            <Tooltip title="Ver Más">
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<EyeOutlined />}
                                                    onClick={() => onView(provider)}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Editar">
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => onEdit(provider)}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => showDeleteModal(provider)}
                                                />
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            {/* Modal de Confirmación para Eliminar */}
            <Modal
                title="Confirmar Eliminación"
                open={isDeleteModalVisible}
                onOk={handleDelete}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Eliminar"
                okButtonProps={{ danger: true }}
                cancelText="Cancelar"
            >
                <p>
                    ¿Estás seguro de que deseas eliminar al proveedor{" "}
                    <strong>{selectedProvider?.razon_social}</strong>?
                </p>
            </Modal>
        </>
    );
};

export default ProvidersTable;
