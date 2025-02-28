import React, { useState, useEffect } from "react";
import { Button, Tooltip, Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ExportOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const FloatingActionMenu = ({
  selectedRowKeys,
  onEdit,
  onDelete,
  onDownload,
  onExport,
  onClearSelection,
}) => {
  const [visible, setVisible] = useState(false);

  // Show the menu only when items are selected
  useEffect(() => {
    if (selectedRowKeys.length > 0) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [selectedRowKeys]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 shadow-lg rounded-lg z-50 py-3 px-6"
      style={{ maxWidth: "calc(100% - 32px)" }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="mr-3 font-medium text-white">
            {selectedRowKeys.length}{" "}
            {selectedRowKeys.length === 1 ? "elemento" : "elementos"} seleccionado
            {selectedRowKeys.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {/* Botón Editar */}
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={onEdit}
              disabled={selectedRowKeys.length !== 1}
              className="text-white hover:text-gray-300"
              style={{ padding: 0, border: "none", background: "transparent" }}
            >
              Editar
            </Button>
          </Tooltip>

          {/* Botón Descargar */}
          <Tooltip title="Descargar comprobantes">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={onDownload}
              className="text-white hover:text-gray-300"
              style={{ padding: 0, border: "none", background: "transparent" }}
            >
              Descargar
            </Button>
          </Tooltip>        

          {/* Botón Eliminar */}
          <Popconfirm
            title="¿Está seguro de eliminar los elementos seleccionados?"
            onConfirm={onDelete}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            placement="topRight"
          >
            <Tooltip title="Eliminar">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-white hover:text-gray-300"
                style={{ padding: 0, border: "none", background: "transparent" }}
              >
                Eliminar
              </Button>
            </Tooltip>
          </Popconfirm>

          {/* Botón Cancelar */}
          <Tooltip title="Cancelar selección">
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClearSelection}
              className="text-white hover:text-gray-300"
              style={{ padding: 0, border: "none", background: "transparent" }}
            >
              Cancelar
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default FloatingActionMenu;