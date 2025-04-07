import React from "react";
import { Button } from "antd";
import { EditOutlined, DownloadOutlined, DeleteOutlined } from "@ant-design/icons";

const FloatingActionMenu = ({
  selectedCount,
  onEdit,
  onDownload,
  onDelete,
  visible,
}) => {
  // If the menu is not visible (i.e., no items are selected), don't render anything
  if (!visible || selectedCount === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#1f1f1f",
        borderRadius: 8,
        padding: "8px 16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        zIndex: 1000,
      }}
    >
      {/* Display the number of selected items */}
      <span style={{ color: "#fff", fontSize: 14 }}>
        {selectedCount} elemento{selectedCount > 1 ? "s" : ""} seleccionado
        {selectedCount > 1 ? "s" : ""}
      </span>

      {/* Edit Button (only enabled if exactly one item is selected) */}
      <Button
        type="text"
        icon={<EditOutlined />}
        onClick={onEdit}
        disabled={selectedCount !== 1}
        style={{
          color: selectedCount === 1 ? "#1890ff" : "#bfbfbf",
          fontSize: 14,
        }}
      >
        Editar
      </Button>

      {/* Download Button */}
      <Button
        type="text"
        icon={<DownloadOutlined />}
        onClick={onDownload}
        style={{ color: "#1890ff", fontSize: 14 }}
      >
        Descargar
      </Button>

      {/* Delete Button */}
      <Button
        type="text"
        icon={<DeleteOutlined />}
        onClick={onDelete}
        style={{ color: "#ff4d4f", fontSize: 14 }}
      >
        Eliminar
      </Button>
    </div>
  );
};

export default FloatingActionMenu;