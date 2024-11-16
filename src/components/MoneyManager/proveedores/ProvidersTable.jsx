import React, { useState } from "react";
import { Button, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";

const ProvidersTable = ({
    providers,
    onDelete,
    onEdit,
    onView,
}) => {
    const [hoveredRow, setHoveredRow] = useState(null);

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
                                <div className="flex items-center justify-center px-3 py-2">
                                    <span className="text-xs font-medium text-gray-500">
                                        {column.title}
                                    </span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {providers.map((provider, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={`border-b hover:bg-gray-50 ${hoveredRow === rowIndex ? "bg-gray-50" : ""
                                }`}
                            onMouseEnter={() => setHoveredRow(rowIndex)}
                            onMouseLeave={() => setHoveredRow(null)}
                        >
                            <td className="border-r border-gray-200 p-2 truncate">
                                {provider.tipo_identificacion}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate">
                                {provider.numero_identificacion}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate">
                                {provider.razon_social}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate">
                                {provider.nombre_comercial}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate">
                                {provider.telefono}
                            </td>
                            <td className="border-r border-gray-200 p-2 truncate">
                                {provider.email}
                            </td>
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
                                            onClick={() => onDelete(provider)}
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

export default ProvidersTable;
