import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Typography, Statistic } from 'antd';
import { PlusOutlined, UserOutlined, PercentageOutlined, BankOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import TableData from '../../Tablas/TablaDatos'; // Reemplaza CashierTable por TableData
import AddCajero from './AddCajero';

const { Title } = Typography;

const CashiersPage = () => {
  const navigate = useNavigate();
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCashiers: 0,
    avgCommission: 0,
    activeCashiers: 0,
  });

  const fetchCashiers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_FINANZAS}/cajeros`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      const cashiersArray = responseData.data || [];
      const mappedCashiers = cashiersArray.map(cashier => ({
        ...cashier,
        key: cashier.id_cajero,
      }));
      setCashiers(mappedCashiers);
      if (mappedCashiers.length > 0) {
        const total = mappedCashiers.length;
        const avgComm = mappedCashiers.reduce((acc, curr) => acc + parseFloat(curr.comision_porcentaje || 0), 0) / total;
        const active = mappedCashiers.filter(cashier => cashier.activo).length;
        setStats({ totalCashiers: total, avgCommission: avgComm, activeCashiers: active });
      }
    } catch (error) {
      console.error('Error al obtener los cajeros:', error);
      setCashiers([]);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los cajeros.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashiers();
  }, []);

  const handleDelete = async (id_cajero) => {
    try {
      if (!id_cajero) throw new Error('ID del cajero no proporcionado');
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
        const response = await fetch(`${import.meta.env.VITE_API_FINANZAS}/cajeros/${id_cajero}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El cajero ha sido eliminado.' });
        await fetchCashiers();
      }
    } catch (error) {
      console.error('Error al eliminar el cajero:', error);
      await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el cajero.' });
    }
  };

  const handleCashierAdded = () => fetchCashiers();

  return (
    <div className="pt-20 px-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-[#0052CC] p-2 rounded-md">
            <FileTextOutlined className="text-white text-lg" />
          </div>
          <Title level={3} className="!m-0 text-[#0052CC]">
            Cajeros / Dashboard
          </Title>
        </div>
        <AddCajero onCashierAdded={handleCashierAdded} />
      </div>

      {/* Pasar datos a TableData */}
      <TableData
        entries={cashiers}
        loading={loading}
        onDelete={handleDelete}
        onRefresh={fetchCashiers}
      />
    </div>
  );
};

export default CashiersPage;