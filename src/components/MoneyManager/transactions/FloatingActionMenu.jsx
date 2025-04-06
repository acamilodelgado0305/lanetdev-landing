import React from "react";
import { Button, Tooltip, Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const FloatingActionMenu = ({
  selectedRowKeys,
  onEdit,
  onDelete,
  onDownload,
  onClearSelection,
}) => {
  // Mostrar el menú solo si hay filas seleccionadas
  if (selectedRowKeys.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 bg-white rounded-lg shadow-lg z-50 px-4 py-2 border border-gray-200"
      style={{ minWidth: "200px" }}
    >
      <div className="flex justify-between items-center">
        <span className="text-gray-600">
          {selectedRowKeys.length} seleccionado(s)
        </span>
        <div className="flex items-center space-x-2">
          {/* Botón Editar */}
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined className="text-gray-500" />}
              onClick={onEdit}
              disabled={selectedRowKeys.length !== 1} // Solo habilitado si hay exactamente 1 seleccionado
              className="hover:bg-gray-100 text-gray-500"
              style={{
                width: 30,
                height: 30,
                borderRadius: 0,
                border: "1px solid #d9d9d9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>

          {/* Botón Eliminar */}
          <Popconfirm
            title={`¿Está seguro de eliminar ${selectedRowKeys.length} elemento(s) seleccionado(s)?`}
            onConfirm={onDelete}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            placement="topRight"
          >
            <Tooltip title="Eliminar">
              <Button
                type="text"
                icon={<DeleteOutlined className="text-gray-500" />}
                className="hover:bg-gray-100 text-gray-500"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 0,
                  border: "1px solid #d9d9d9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </Tooltip>
          </Popconfirm>

          {/* Botón Descargar */}
          <Tooltip title="Descargar comprobantes">
            <Button
              type="text"
              icon={<DownloadOutlined className="text-gray-500" />}
              onClick={onDownload}
              className="hover:bg-gray-100 text-gray-500"
              style={{
                width: 30,
                height: 30,
                borderRadius: 0,
                border: "1px solid #d9d9d9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>

          {/* Botón Limpiar Selección */}
          <Tooltip title="Limpiar selección">
            <Button
              type="text"
              icon={<CloseOutlined className="text-gray-500" />}
              onClick={onClearSelection}
              className="hover:bg-gray-100 text-gray-500"
              style={{
                width: 30,
                height: 30,
                borderRadius: 0,
                border: "1px solid #d9d9d9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default FloatingActionMenu;