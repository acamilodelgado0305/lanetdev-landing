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
  // Si no está visible o no hay elementos seleccionados, no renderizar nada
  if (!visible || selectedCount === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 30, // Aumentado para más separación del borde inferior
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#1f1f1f",
        borderRadius: 10, // Bordes más redondeados
        padding: "12px 24px", // Más padding para hacerlo más grande
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)", // Sombra más pronunciada
        display: "flex",
        alignItems: "center",
        gap: 20, // Más espacio entre elementos
        zIndex: 1000,
      }}
    >
      {/* Mostrar el número de elementos seleccionados */}
      <span style={{ color: "#fff", fontSize: 16, fontWeight: 500 }}>
        {selectedCount} elemento{selectedCount !== 1 ? "s" : ""} seleccionado
        {selectedCount !== 1 ? "s" : ""}
      </span>

      {/* Botón Editar (habilitado solo si hay exactamente un elemento seleccionado) */}
      <Button
        type="text"
        icon={<EditOutlined style={{ fontSize: 20 }} />} // Ícono más grande
        onClick={onEdit}
        disabled={selectedCount !== 1}
        style={{
          color: selectedCount === 1 ? "#ffffff" : "#bfbfbf",
          fontSize: 16, // Texto más grande
          height: "auto",
          display: "flex",
          alignItems: "center",
        }}
      >
        Editar
      </Button>

      {/* Botón Descargar */}
      <Button
        type="text"
        icon={<DownloadOutlined style={{ fontSize: 20 }} />} // Ícono más grande
        onClick={onDownload}
        style={{
          color: "#ffffff",
          fontSize: 16, // Texto más grande
          height: "auto",
          display: "flex",
          alignItems: "center",
        }}
      >
        Descargar
      </Button>

      {/* Botón Eliminar */}
      <Button
        type="text"
        icon={<DeleteOutlined style={{ fontSize: 20 }} />} // Ícono más grande
        onClick={onDelete}
        style={{
          color: "#ff4d4f",
          fontSize: 16, // Texto más grande
          height: "auto",
          display: "flex",
          alignItems: "center",
        }}
      >
        Eliminar
      </Button>
    </div>
  );
};

export default FloatingActionMenu;