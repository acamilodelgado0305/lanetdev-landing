import React, { useState, useEffect } from "react";
import { Table, Input, Tag } from "antd";
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import axios from "axios";
import AccionesTerceros from "../AccionesTerceros";
import AddCajero from "./NuevoCajero";

const CajerosTable = ({ activeTab, cajeros, onUpdate, onEditCashier }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Control AddCajero visibility
  const [cashierToEdit, setCashierToEdit] = useState(null); // Pass to AddCajero

  useEffect(() => {
    const mappedCashiers = cajeros.map((cashier) => ({
      id: cashier.id_cajero,
      nombre: cashier.nombre,
      municipio: cashier.municipio,
      responsable: cashier.responsable,
      direccion: cashier.direccion,
      importes_personalizados: cashier.importes_personalizados || [],
    }));
    setFilteredEntries(mappedCashiers);
  }, [cajeros]);

  useEffect(() => {
    const filtered = cajeros
      .filter((cashier) =>
        Object.entries(searchText).every(([key, value]) => {
          if (!value) return true;
          return String(cashier[key] || "").toLowerCase().includes(value);
        })
      )
      .map((cashier) => ({
        id: cashier.id_cajero,
        nombre: cashier.nombre,
        municipio: cashier.municipio,
        responsable: cashier.responsable,
        direccion: cashier.direccion,
        importes_personalizados: cashier.importes_personalizados || [],
      }));
    setFilteredEntries(filtered);
  }, [searchText, cajeros]);

  const handleSearch = (value, dataIndex) => {
    setSearchText((prev) => ({
      ...prev,
      [dataIndex]: value.toLowerCase(),
    }));
  };

  const handleRowClick = (record) => {
    const cashier = cajeros.find((c) => c.id_cajero === record.id); // Get full cashier data
    setCashierToEdit(cashier); // Set cashier to edit
    setModalVisible(true); // Show modal
  };

  const handleBatchOperation = (operation) => {
    if (selectedRowKeys.length === 0) {
      Swal.fire({
        title: "Selección vacía",
        text: "Por favor, seleccione al menos un registro",
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Entendido",
      });
      return;
    }

    const selectedItems = filteredEntries.filter((item) =>
      selectedRowKeys.includes(item.id)
    );

    switch (operation) {
      case "edit":
        if (selectedRowKeys.length > 1) {
          Swal.fire({
            title: "Edición no permitida",
            text: "Solo puedes editar un cajero a la vez.",
            icon: "warning",
            confirmButtonColor: "#3085d6",
          });
        } else {
          const cashierToEdit = cajeros.find((c) => c.id_cajero === selectedItems[0].id);
          if (onEditCashier) {
            onEditCashier(cashierToEdit);
            setSelectedRowKeys([]);
          }
        }
        break;
      case "delete":
        const deletePromises = selectedRowKeys.map((id) => handleDeleteItem(id));
        Promise.all(deletePromises)
          .then(() => {
            Swal.fire("¡Eliminado!", "Los registros han sido eliminados.", "success");
            setSelectedRowKeys([]);
            if (onUpdate) onUpdate();
          })
          .catch((error) => {
            console.error("Error eliminando registros:", error);
            Swal.fire("Error", "Hubo un problema al eliminar los registros.", "error");
          });
        break;
      case "download":
        console.log("Descargando:", selectedItems);
        Swal.fire("Descarga", "Funcionalidad de descarga no implementada aún", "info");
        break;
      default:
        break;
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || "/api";
      await axios.delete(`${API_BASE_URL}/cajeros/${id}`);
      setFilteredEntries((prev) => prev.filter((item) => item.id !== id));
      return id;
    } catch (error) {
      console.error(`Error eliminando el cajero ${id}:`, error);
      throw error;
    }
  };

  const handleEditSelected = () => handleBatchOperation("edit");
  const handleDeleteSelected = () => handleBatchOperation("delete");
  const handleDownloadSelected = () => handleBatchOperation("download");
  const clearSelection = () => setSelectedRowKeys([]);

  const columns = [
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
          Nombre
          <Input
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => handleSearch(e.target.value, "nombre")}
            style={{
              marginTop: 2,
              padding: 4,
              height: 28,
              fontSize: 12,
              border: "1px solid #d9d9d9",
              borderRadius: 4,
              outline: "none",
            }}
          />
        </div>
      ),
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => (a.nombre || "").localeCompare(b.nombre || ""),
      render: (nombre) => <Tag color="purple">{nombre}</Tag>,
      width: 150,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1 }}>
          Responsable
          <Input
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => handleSearch(e.target.value, "responsable")}
            style={{
              marginTop: 2,
              padding: 4,
              height: 28,
              fontSize: 12,
              border: "1px solid #d9d9d9",
              borderRadius: 4,
            }}
          />
        </div>
      ),
      dataIndex: "responsable",
      key: "responsable",
      sorter: (a, b) => (a.responsable || "").localeCompare(b.responsable || ""),
      width: 150,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1 }}>
          Municipio
          <Input
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => handleSearch(e.target.value, "municipio")}
            style={{
              marginTop: 2,
              padding: 4,
              height: 28,
              fontSize: 12,
              border: "1px solid #d9d9d9",
              borderRadius: 4,
            }}
          />
        </div>
      ),
      dataIndex: "municipio",
      key: "municipio",
      sorter: (a, b) => (a.municipio || "").localeCompare(b.municipio || ""),
      width: 110,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1 }}>
          Dirección
          <Input
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => handleSearch(e.target.value, "direccion")}
            style={{
              marginTop: 2,
              padding: 4,
              height: 28,
              fontSize: 12,
              border: "1px solid #d9d9d9",
              borderRadius: 4,
            }}
          />
        </div>
      ),
      dataIndex: "direccion",
      key: "direccion",
      sorter: (a, b) => (a.direccion || "").localeCompare(b.direccion || ""),
      width: 150,
    },
    {
      title: "Importes Personalizados",
      key: "importes_personalizados",
      render: (_, record) => (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {record.importes_personalizados.length > 0 ? (
            <>
              <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 20, marginRight: 8 }} />
              {`${record.importes_personalizados.length} ítems`}
            </>
          ) : (
            <>
              <CloseCircleOutlined style={{ color: "#d9d9d9", fontSize: 20, marginRight: 8 }} />
              {"Sin importes"}
            </>
          )}
        </span>
      ),
      width: 150,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    columnWidth: 48,
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setCashierToEdit(null); // Clear cashier data when closing
  };

  const handleCashierAdded = () => {
    if (onUpdate) onUpdate(); // Refresh table data after save
  };

  return (
    <>
      <AccionesTerceros
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedRowKeys={selectedRowKeys}
        handleEditSelected={handleEditSelected}
        handleDeleteSelected={handleDeleteSelected}
        handleDownloadSelected={handleDownloadSelected}
        handleExportSelected={() => console.log("Exportar no implementado")}
        clearSelection={clearSelection}
        activeTab={activeTab}
        filteredEntries={filteredEntries}
        setSelectedRowKeys={setSelectedRowKeys}
        providers={[]}
        setProviderFilter={() => { }}
        setTypeFilter={() => { }}
      />

      <div className="px-5 py-2 bg-white">
        <Table
          rowSelection={rowSelection}
          dataSource={filteredEntries}
          columns={columns}
          rowKey={(record) => record.id}
          pagination={false}
          bordered
          size="middle"
          loading={entriesLoading}
          onRow={(record) => ({
            onClick: (e) => {
              if (
                e.target.tagName !== "INPUT" &&
                e.target.tagName !== "BUTTON" &&
                e.target.tagName !== "A"
              ) {
                handleRowClick(record);
              }
            },
          })}
          rowClassName="hover:bg-gray-50 transition-colors"
          scroll={{ x: "max-content", y: 700 }}
        />
      </div>

      {/* AddCajero Modal */}
      <AddCajero
        visible={modalVisible}
        onClose={handleCloseModal}
        cashierToEdit={cashierToEdit}
        onCashierAdded={handleCashierAdded}
      />
    </>
  );
};

export default CajerosTable;