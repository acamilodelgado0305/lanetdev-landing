import React, { useState, useEffect } from "react";
import { Table, Input, Button, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import Swal from "sweetalert2";
import AccionesTerceros from "../AccionesTerceros";

const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

const ProveedoresTable = ({ activeTab }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    setEntriesLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/providers`);
      const proveedoresArray = response.data || []; // Ajustado según la estructura que proporcionaste
      
      const mappedProveedores = proveedoresArray.map(proveedor => ({
        id: proveedor.id,
        tipo_identificacion: proveedor.tipo_identificacion,
        numero_identificacion: proveedor.numero_identificacion,
        nombre_comercial: proveedor.nombre_comercial,
        contacto: `${proveedor.nombres_contacto} ${proveedor.apellidos_contacto}`,
        direccion: proveedor.direccion,
        ciudad: proveedor.ciudad,
        correo: proveedor.correo_contacto_facturacion,
        telefono: proveedor.telefono_facturacion,
        estado: proveedor.estado
      }));
      
      setFilteredEntries(mappedProveedores);
      setError(null);
    } catch (error) {
      console.error('Error al obtener los proveedores:', error);
      setError('No se pudieron cargar los proveedores');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los proveedores. Por favor, intente de nuevo.',
      });
    } finally {
      setEntriesLoading(false);
    }
  };

  useEffect(() => {
    const filtered = filteredEntries.filter(proveedor => {
      return Object.entries(searchText).every(([key, value]) => {
        if (!value) return true;
        return String(proveedor[key] || '').toLowerCase().includes(value.toLowerCase());
      });
    });
    setFilteredEntries([...filtered]); // Creamos una nueva copia para forzar la actualización
  }, [searchText]);

  const handleSearch = (value, dataIndex) => {
    setSearchText(prev => ({
      ...prev,
      [dataIndex]: value,
    }));
  };

  const columns = [
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1 }}>
          Nombre Comercial
          <Input
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => handleSearch(e.target.value, "nombre_comercial")}
            style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
          />
        </div>
      ),
      dataIndex: "nombre_comercial",
      key: "nombre_comercial",
      sorter: (a, b) => a.nombre_comercial.localeCompare(b.nombre_comercial),
      width: 200,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1 }}>
          Tipo Identificación
          <Input
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => handleSearch(e.target.value, "tipo_identificacion")}
            style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
          />
        </div>
      ),
      dataIndex: "tipo_identificacion",
      key: "tipo_identificacion",
      width: 130,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1 }}>
          Número Identificación
          <Input
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => handleSearch(e.target.value, "numero_identificacion")}
            style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
          />
        </div>
      ),
      dataIndex: "numero_identificacion",
      key: "numero_identificacion",
      width: 150,
    },
    {
      title: "Contacto",
      dataIndex: "contacto",
      key: "contacto",
      sorter: (a, b) => a.contacto.localeCompare(b.contacto),
      width: 180,
    },
    {
      title: "Ciudad",
      dataIndex: "ciudad",
      key: "ciudad",
      sorter: (a, b) => a.ciudad.localeCompare(b.ciudad),
      width: 120,
    },
    {
      title: "Correo",
      dataIndex: "correo",
      key: "correo",
      width: 200,
      render: (text) => <a href={`mailto:${text}`}>{text}</a>,
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
      key: "telefono",
      width: 130,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 100,
      render: (estado) => (
        <Tag color={estado === "activo" || estado === "true" ? "green" : "red"}>
          {estado === "true" ? "Activo" : estado}
        </Tag>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    columnWidth: 48,
  };

  return (
    <>
      <AccionesTerceros
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedRowKeys={selectedRowKeys}
        activeTab={activeTab}
      />

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded border border-red-200">
          <p className="font-medium">{error}</p>
          <Button
            type="primary"
            danger
            onClick={fetchProveedores}
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      )}

      <div className="px-5 py-2 bg-white">
        <Table
          rowSelection={rowSelection}
          dataSource={filteredEntries}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          bordered
          size="middle"
          loading={entriesLoading}
          scroll={{ x: 1300 }}
        />
      </div>

      <style>
        {`
          .ant-table-cell {
            padding: 8px !important;
            font-size: 14px;
          }
          .ant-table-thead > tr > th {
            background-color: #f5f5f5;
            font-weight: 600;
          }
          .ant-table-row:hover {
            cursor: pointer;
            background-color: #f9f9f9;
          }
        `}
      </style>
    </>
  );
};

export default ProveedoresTable;