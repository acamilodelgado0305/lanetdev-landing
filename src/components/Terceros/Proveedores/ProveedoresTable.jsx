import React, { useState, useEffect } from "react";
import { Table, Input, Button, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import Swal from "sweetalert2";
import AccionesTerceros from "../AccionesTerceros";
import dayjs from 'dayjs';

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
      let proveedoresArray = response.data || [];

      // Validar que la respuesta es un array
      if (!Array.isArray(proveedoresArray)) {
        proveedoresArray = []; // Si no es un array, asigna un array vacío
      }

      // Mapear los proveedores
      const mappedProveedores = proveedoresArray.map(proveedor => ({
        id: proveedor.id,
        tipo_identificacion: proveedor.tipo_identificacion || 'No disponible',
        numero_identificacion: proveedor.numero_identificacion || 'No disponible',
        nombre_comercial: proveedor.nombre_comercial || 'No disponible',
        contacto: `${proveedor.nombres_contacto || 'No disponible'} ${proveedor.apellidos_contacto || 'No disponible'}`,
        direccion: proveedor.direccion || 'No disponible',
        ciudad: proveedor.ciudad || 'No disponible',
        correo: proveedor.correo?.map(c => c.email).join(", ") || 'No disponible',
        telefono: proveedor.telefono?.map(t => `${t.tipo}: ${t.numero}`).join(", ") || 'No disponible',
        estado: proveedor.estado || 'No disponible',
        departamento: proveedor.departamento?.trim() || 'No disponible',
        sitioweb: proveedor.sitioweb || 'No disponible',
        medio_pago: proveedor.medio_pago || 'No disponible',
        fecha_vencimiento: proveedor.fecha_vencimiento || 'No disponible',
      }));

      setFilteredEntries(mappedProveedores);
      setError(null);
    } catch (error) {
      console.error("Error al obtener los proveedores:", error);
      setError("No se pudieron cargar los proveedores");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los proveedores. Por favor, intente de nuevo.",
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
      title: "Tipo Identificación",
      dataIndex: "tipo_identificacion",
      key: "tipo_identificacion",
      width: 130,
    },
    {
      title: "Número Identificación",
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
      width: 180,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 100,
      render: (estado) => (
        <Tag color={estado === "activo" ? "green" : "red"}>
          {estado === "activo" ? "Activo" : estado}
        </Tag>
      ),
    },
    // Puedes agregar más columnas si lo deseas, como "departamento" o "sitioweb".
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    columnWidth: 48,
  };

  // Expander para mostrar los detalles de los teléfonos y correos
  const expandedRowRender = (record) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 mx-32">
        {/* Departamento */}
        <div className="flex items-center text-sm">
          <p><strong>Departamento:</strong> {record.departamento}</p>
        </div>

        {/* Estado */}
        <div className="flex items-center text-sm">
          <p><strong>Estado:</strong> {record.estado}</p>
        </div>

        {/* Medio de pago */}
        <div className="flex items-center text-sm">
          <p><strong>Medio de pago:</strong> {record.medio_pago}</p>
        </div>

        {/* Fecha de Vencimiento */}
        <div className="flex items-center text-sm">
          <p><strong>Fecha de Vencimiento:</strong></p>
          <p>{dayjs(record.fecha_vencimiento).isValid() ? dayjs(record.fecha_vencimiento).format("DD/MM/YYYY") : "Fecha inválida"}</p>
        </div>

        {/* Sitio Web */}
        <div className="flex items-center text-sm">
          <p><strong>Sitio Web:</strong> <a href={record.sitioweb} target="_blank" rel="noopener noreferrer" className="text-blue-500">{record.sitioweb}</a></p>
        </div>

        {/* Teléfonos */}
        <div className="flex items-center text-sm">
          <p><strong>Teléfonos:</strong></p>
          <div className="flex flex-col gap-1">
            {record.telefono.split(", ").map((tel, index) => (
              <span key={index} className="bg-gray-200 text-xs px-1 py-0.5 rounded-md">{tel}</span>
            ))}
          </div>
        </div>

        {/* Correos */}
        <div className="flex items-center text-sm">
          <p><strong>Correos:</strong></p>
          <div className="flex flex-col gap-1">
            {record.correo.split(", ").map((mail, index) => (
              <span key={index} className="bg-gray-200 text-xs px-1 py-0.5 rounded-md">{mail}</span>
            ))}
          </div>
        </div>
      </div>
    );
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
          expandedRowRender={expandedRowRender}  // Activar el expander
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
