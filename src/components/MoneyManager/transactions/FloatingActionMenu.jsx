import React, { useState, useEffect } from "react";
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
 

  // Show the menu only when items are selected
  

  return (
    <div className="bg-white  rounded-lg z-50  px-4">
      <div className="flex justify-between items-center">
        
        <div className="flex items-center space-x-2">
          {/* Botón Editar */}
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined className="text-gray-500" />}
              onClick={onEdit}
              disabled={selectedRowKeys.length !== 1}
              className="hover:bg-gray-100 text-gray-500"
              style={{
                width: 30,
                height: 30,
                borderRadius: 0,
                border: "1px solid #d9d9d9", // Borde gris claro
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>

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
                icon={<DeleteOutlined className="text-gray-500" />}
                className="hover:bg-gray-100 text-gray-500"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 0,
                  border: "1px solid #d9d9d9", // Borde gris claro
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
                border: "1px solid #d9d9d9", // Borde gris claro
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Tooltip>

          {/* Botón Eliminar */}
          

          
        </div>
      </div>
    </div>
  );
};

export default FloatingActionMenu;