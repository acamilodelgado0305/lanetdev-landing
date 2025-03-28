import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import TableData from '../../Tablas/TablaDatos';
import AddProvider from '../../Terceros/Proveedores/AddProvider';


const { Title } = Typography;

const ProvidersPage = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProviders: 0,
    avgRating: 0,
    activeProviders: 0,
  });

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_FINANZAS}/providers`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      // Aquí procesamos los datos según el formato que mostraste
      const providersArray = await response.json();
      console.log("Datos recibidos de la API:", providersArray);
      
      // Aseguramos que los datos sean un array
      const dataArray = Array.isArray(providersArray) ? providersArray : (providersArray.data || []);
      
      // Mapeamos los datos y añadimos la propiedad key usando id
      const mappedProviders = dataArray.map(provider => ({
        ...provider,
        key: provider.id,
        // Convertimos id a id_proveedor para mantener compatibilidad con el componente existente
        id_proveedor: provider.id
      }));
      
      console.log("Providers mapeados:", mappedProviders);
      
      // Guardamos los proveedores mapeados en el estado
      setProviders(mappedProviders);
      
      if (mappedProviders.length > 0) {
        const total = mappedProviders.length;
        // Calculamos stats con valores predeterminados en caso de que no existan
        const avgRating = mappedProviders.reduce((acc, curr) => acc + parseFloat(curr.calificacion || 0), 0) / total;
        const active = mappedProviders.filter(provider => provider.activo === true).length;
        setStats({ totalProviders: total, avgRating: avgRating || 0, activeProviders: active });
      }
    } catch (error) {
      console.error('Error al obtener los proveedores:', error);
      setProviders([]);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los proveedores.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleDelete = async (id_proveedor) => {
    try {
      if (!id_proveedor) throw new Error('ID del proveedor no proporcionado');
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });
      if (result.isConfirmed) {
        const response = await fetch(`${import.meta.env.VITE_API_FINANZAS}/providers/${id_proveedor}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El proveedor ha sido eliminado.' });
        await fetchProviders();
      }
    } catch (error) {
      console.error('Error al eliminar el proveedor:', error);
      await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el proveedor.' });
    }
  };

  const handleProviderAdded = () => fetchProviders();

  return (
    <div className=" px-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-[#0052CC] p-2 rounded-md">
            <FileTextOutlined className="text-white text-lg" />
          </div>
          <Title level={3} className="!m-0 text-[#0052CC]">
            Proveedores / Dashboard
          </Title>
        </div>
        <AddProvider onProviderAdded={handleProviderAdded} />
      </div>

      {/* Pasar datos a TableData */}
      <TableData
        entries={providers}
        loading={loading}
        onDelete={handleDelete}
        onRefresh={fetchProviders}
      />
    </div>
  );
};

export default ProvidersPage;