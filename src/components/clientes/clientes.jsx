import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const apiUrl =
      import.meta.env.MODE === 'production'
        ? `${import.meta.env.VITE_API_URL}/api/clientes/`
        : '/wisphub-api/api/clientes/';

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
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  // Calcular el rango de datos a mostrar en la tabla
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedClients = clients.slice(startIndex, endIndex);

  const columns = [
    { field: "id_servicio", headerName: "ID Servicio", width: 100 },
    { field: "usuario", headerName: "Usuario", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "cedula", headerName: "Cédula", width: 150 },
    { field: "direccion", headerName: "Dirección", width: 200 },
    { field: "localidad", headerName: "Localidad", width: 150 },
    { field: "ciudad", headerName: "Ciudad", width: 150 },
    { field: "telefono", headerName: "Teléfono", width: 150 },
    { field: "descuento", headerName: "Descuento", width: 100 },
    { field: "saldo", headerName: "Saldo", width: 100 },
    { field: "estado", headerName: "Estado", width: 100 },
    { field: "ip", headerName: "IP", width: 150 },
    { field: "fecha_instalacion", headerName: "Fecha Instalación", width: 180 },
    { field: "plan_internet.nombre", headerName: "Plan Internet", width: 200 },
    { field: "tecnico.nombre", headerName: "Técnico", width: 200 },
  ];

  const handleSelectionChange = (selection) => {
    const selectedRowIndex = selection.length > 0 ? selection[0] : null;

    if (selectedRowIndex !== null) {
      const selectedClientId = paginatedClients[selectedRowIndex].id_servicio;
      navigate(`/clientes/${selectedClientId}`);
    }
  };

  const totalPages = Math.ceil(clients.length / pageSize);

  return (
    <div className="container mx-auto mt-10">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Clientes</h1>
      </div>

      <div style={{ width: "100%", height: "70vh" }}>
        <DataGrid
          rows={clients}
          columns={columns}
          pageSize={100}
          checkboxSelection
          disableSelectionOnClick
          getRowId={(row) => row.id_servicio}
          onSelectionModelChange={handleSelectionChange}
          pagination={false}
        />
      </div>
      {/* <div className="flex justify-center mt-5">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0}
          className="mr-2 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Anterior
        </button>
        <span>Página {page + 1} de {totalPages}</span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="ml-2 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Siguiente
        </button>
      </div> */}
    </div>
  );
};

export default Clients;
