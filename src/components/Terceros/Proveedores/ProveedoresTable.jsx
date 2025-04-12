import React, { useState, useEffect } from "react";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import Swal from "sweetalert2";
import AccionesTerceros from "../AccionesTerceros";
import dayjs from "dayjs";

const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

const ProveedoresTable = ({ activeTab }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedRows, setExpandedRows] = useState([]);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    setEntriesLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/providers`);
      console.log("API Response:", response.data); // Debug: Log raw response

      let proveedoresArray = response.data || [];

      // Ensure proveedoresArray is an array
      if (!Array.isArray(proveedoresArray)) {
        console.warn("proveedoresArray is not an array:", proveedoresArray);
        proveedoresArray = [];
      }

      const mappedProveedores = proveedoresArray.map((proveedor, index) => {
        console.log(`Processing provider ${index}:`, proveedor); // Debug: Log each provider

        // Guard correo
        const correo = Array.isArray(proveedor.correo)
          ? proveedor.correo.map((c) => c.email).join(", ") || "No disponible"
          : "No disponible";

        // Guard telefono
        const telefono = Array.isArray(proveedor.telefono)
          ? proveedor.telefono.map((t) => `${t.tipo}: ${t.numero}`).join(", ") || "No disponible"
          : "No disponible";

        return {
          id: proveedor.id || `temp-id-${index}`,
          tipo_identificacion: proveedor.tipo_identificacion || "No disponible",
          numero_identificacion: proveedor.numero_identificacion || "No disponible",
          nombre_comercial: proveedor.nombre_comercial || "No disponible",
          contacto: `${proveedor.nombres_contacto || "No disponible"} ${proveedor.apellidos_contacto || "No disponible"}`,
          direccion: proveedor.direccion || "No disponible",
          ciudad: proveedor.ciudad || "No disponible",
          correo,
          telefono,
          prefijo: proveedor.prefijo || "No disponible",
          estado: proveedor.estado || "No disponible",
          departamento: proveedor.departamento?.trim() || "No disponible",
          pais: proveedor.pais || "No disponible",
          sitioweb: proveedor.sitioweb || "No disponible",
          medio_pago: proveedor.medio_pago || "No disponible",
          fecha_vencimiento: proveedor.fecha_vencimiento || "No disponible",
        };
      });

      console.log("Mapped Proveedores:", mappedProveedores); // Debug: Log final mapped data

      setEntries(mappedProveedores);
      setFilteredEntries(mappedProveedores);
      setError(null);
    } catch (error) {
      console.error("Error al obtener los proveedores:", error);
      setError("No se pudieron cargar los proveedores: " + error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los proveedores. Por favor, intente de nuevo.",
      });
    } finally {
      setEntriesLoading(false);
    }
  };

  // Handle search
  useEffect(() => {
    const filtered = entries.filter((proveedor) =>
      proveedor.nombre_comercial.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredEntries(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchText, entries]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...filteredEntries].sort((a, b) => {
      const aValue = a[key] || "";
      const bValue = b[key] || "";
      if (direction === "asc") {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });

    setSortConfig({ key, direction });
    setFilteredEntries(sorted);
  };

  // Handle row selection
  const handleSelectRow = (id) => {
    setSelectedRowKeys((prev) =>
      prev.includes(id) ? prev.filter((key) => key !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowKeys(paginatedEntries.map((entry) => entry.id));
    } else {
      setSelectedRowKeys([]);
    }
  };

  // Handle row expansion
  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / pageSize);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="bg-white">
      <AccionesTerceros
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        selectedRowKeys={selectedRowKeys}
        activeTab={activeTab}
      />

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded border border-red-200">
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchProveedores}
            className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="px-5 py-2">
        {entriesLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-12 w-12 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative w-full max-w-xs">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar por nombre comercial..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>


            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${currentPage === totalPages
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                  Siguiente
                </button>
              </div>

              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >


                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    Mostrar {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 w-12">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          paginatedEntries.length > 0 &&
                          paginatedEntries.every((entry) => selectedRowKeys.includes(entry.id))
                        }
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </th>
                    <th
                      className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 cursor-pointer w-48"
                      onClick={() => handleSort("nombre_comercial")}
                    >
                      Nombre Comercial
                      {sortConfig.key === "nombre_comercial" && (
                        <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"}</span>
                      )}
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 w-32">
                      Tipo Identificación
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 w-40">
                      Número Identificación
                    </th>
                    <th
                      className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 cursor-pointer w-44"
                      onClick={() => handleSort("contacto")}
                    >
                      Contacto
                      {sortConfig.key === "contacto" && (
                        <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"}</span>
                      )}
                    </th>
                    <th
                      className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 cursor-pointer w-28"
                      onClick={() => handleSort("ciudad")}
                    >
                      Ciudad
                      {sortConfig.key === "ciudad" && (
                        <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"}</span>
                      )}
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 w-48">
                      Correo
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 w-44">
                      Teléfono
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 w-24">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEntries.map((proveedor) => (
                    <React.Fragment key={proveedor.id}>
                      <tr
                        className="border-t hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleRowExpansion(proveedor.id)}
                      >
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <input
                            type="checkbox"
                            checked={selectedRowKeys.includes(proveedor.id)}
                            onChange={() => handleSelectRow(proveedor.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">{proveedor.nombre_comercial}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">{proveedor.tipo_identificacion}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">{proveedor.numero_identificacion}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">{proveedor.contacto}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">{proveedor.ciudad}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <a href={`mailto:${proveedor.correo}`} className="text-blue-500 hover:underline">
                            {proveedor.correo}
                          </a>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-800">{proveedor.telefono}</td>
                        <td className="py-3 px-4 text-sm text-gray-800">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${proveedor.estado === "activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                          >
                            {proveedor.estado === "activo" ? "Activo" : proveedor.estado}
                          </span>
                        </td>
                      </tr>
                      {expandedRows.includes(proveedor.id) && (
                        <tr>
                          <td colSpan={9} className="p-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50">
                              <div className="flex items-center text-sm text-gray-800">
                                <p>
                                  <strong>Departamento:</strong> {proveedor.departamento}
                                </p>
                              </div>
                              <div className="flex items-center text-sm text-gray-800">
                                <p>
                                  <strong>Departamento:</strong> {proveedor.pais}
                                </p>
                              </div>
                              <div className="flex items-center text-sm text-gray-800">
                                <p>
                                  <strong>Estado:</strong> {proveedor.estado}
                                </p>
                              </div>
                              <div className="flex items-center text-sm text-gray-800">
                                <p>
                                  <strong>Medio de pago:</strong> {proveedor.medio_pago}
                                </p>
                              </div>
                              <div className="flex items-center text-sm text-gray-800">
                                <p>
                                  <strong>Medio de pago:</strong> {proveedor.prefijo}
                                </p>
                              </div>
                              <div className="flex items-center text-sm text-gray-800">
                                <p>
                                  <strong>Fecha de Vencimiento:</strong>{" "}
                                  {dayjs(proveedor.fecha_vencimiento).isValid()
                                    ? dayjs(proveedor.fecha_vencimiento).format("DD/MM/YYYY")
                                    : "Fecha inválida"}
                                </p>
                              </div>
                              <div className="flex items-center text-sm text-gray-800">
                                <p>
                                  <strong>Sitio Web:</strong>{" "}
                                  <a
                                    href={proveedor.sitioweb}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    {proveedor.sitioweb}
                                  </a>
                                </p>
                              </div>
                              <div className="flex items-center text-sm text-gray-800">
                                <p>
                                  <strong>Teléfonos:</strong>
                                </p>
                                <div className="flex flex-col gap-1 ml-2">
                                  {proveedor.telefono.split(", ").map((tel, index) => (
                                    <span
                                      key={index}
                                      className="bg-gray-200 text-xs px-2 py-1 rounded-md"
                                    >
                                      {tel}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-gray-800">
                                <p>
                                  <strong>Correos:</strong>
                                </p>
                                <div className="flex flex-col gap-1 ml-2">
                                  {proveedor.correo.split(", ").map((mail, index) => (
                                    <span
                                      key={index}
                                      className="bg-gray-200 text-xs px-2 py-1 rounded-md"
                                    >
                                      {mail}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-sm text-gray-700">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </div>

            {/* Pagination */}

          </>
        )}
      </div>
    </div>
  );
};

export default ProveedoresTable;