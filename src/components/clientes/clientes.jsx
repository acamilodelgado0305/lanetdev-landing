import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const apiUrl =
      import.meta.env.MODE === 'production'
        ? `${import.meta.env.VITE_API_URL}/api/clientes/`
        : '/wisphub-api/api/clientes/';

    setLoading(true);
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Authorization": `${import.meta.env.VITE_API_KEY}`,
        },
      });

      setClients(response.data.results || []);
    } catch (error) {
      console.error('Error fetching clients:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "ID Servicio", dataIndex: "id_servicio", key: "id_servicio", width: 100 },
    { title: "Usuario", dataIndex: "usuario", key: "usuario", width: 150 },
    { title: "Email", dataIndex: "email", key: "email", width: 200 },
    { title: "Cédula", dataIndex: "cedula", key: "cedula", width: 150 },
    { title: "Dirección", dataIndex: "direccion", key: "direccion", width: 200 },
    { title: "Localidad", dataIndex: "localidad", key: "localidad", width: 150 },
    { title: "Ciudad", dataIndex: "ciudad", key: "ciudad", width: 150 },
    { title: "Teléfono", dataIndex: "telefono", key: "telefono", width: 150 },
    { title: "Descuento", dataIndex: "descuento", key: "descuento", width: 100 },
    { title: "Saldo", dataIndex: "saldo", key: "saldo", width: 100 },
    { title: "Estado", dataIndex: "estado", key: "estado", width: 100 },
    { title: "IP", dataIndex: "ip", key: "ip", width: 150 },
    { title: "Fecha Instalación", dataIndex: "fecha_instalacion", key: "fecha_instalacion", width: 180 },
    { 
      title: "Plan Internet", 
      dataIndex: ["plan_internet", "nombre"], 
      key: "plan_internet", 
      width: 200 
    },
    { 
      title: "Técnico", 
      dataIndex: ["tecnico", "nombre"], 
      key: "tecnico", 
      width: 200 
    },
  ];

  return (
    <div className="container mx-auto mt-10">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Clientes</h1>
      </div>

      <Table
        columns={columns}
        dataSource={clients}
        rowKey="id_servicio"
        loading={loading}
        scroll={{ x: 'max-content', y: '70vh' }}
        pagination={{
          defaultPageSize: 100,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} items`,
        }}
        onRow={(record) => ({
          onClick: () => navigate(`/clientes/${record.id_servicio}`)
        })}
      />
    </div>
  );
};

export default Clients;