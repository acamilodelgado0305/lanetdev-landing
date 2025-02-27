import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Typography, Statistic, Table } from 'antd';
import { PlusOutlined, UserOutlined, PercentageOutlined, BankOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import CashierTable from './CajerosTable';

const { Title } = Typography;

const CashiersPage = () => {
  const navigate = useNavigate();
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCashiers: 0,
    avgCommission: 0,
    activeCashiers: 0
  });



  const fetchCashiers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_TERCEROS}/cajeros`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // Extraer el array de cajeros de la propiedad 'data'
      const cashiersArray = responseData.data || [];

      // Mapear los datos y agregar la key usando id_cajero
      const mappedCashiers = cashiersArray.map(cashier => ({
        ...cashier,
        key: cashier.id_cajero // Usar id_cajero como key
      }));

      setCashiers(mappedCashiers);

      if (mappedCashiers.length > 0) {
        const total = mappedCashiers.length;
        const avgComm = mappedCashiers.reduce((acc, curr) => acc + parseFloat(curr.comision_porcentaje || 0), 0) / total;
        const active = mappedCashiers.filter(cashier => cashier.activo).length;

        setStats({
          totalCashiers: total,
          avgCommission: avgComm,
          activeCashiers: active
        });
      }
    } catch (error) {
      console.error('Error al obtener los cajeros:', error);
      setCashiers([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los cajeros. Por favor, intente de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashiers();
  }, []);

  const handleDelete = async (id_cajero) => {
    try {
      // Verificar que el id_cajero existe
      if (!id_cajero) {
        throw new Error('ID del cajero no proporcionado');
      }

      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const response = await fetch(`${import.meta.env.VITE_API_TERCEROS}/cajeros/${id_cajero}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        await Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El cajero ha sido eliminado exitosamente'
        });

        // Actualizar la lista de cajeros
        await fetchCashiers();
      }
    } catch (error) {
      console.error('Error al eliminar el cajero:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el cajero. Por favor, intente de nuevo.'
      });
    }
  };

  return (
    <div className="p-6 w-full mx-auto">
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex p-4 items-center gap-2">
          <div className="bg-[#0052CC] p-2 ">
            <FileTextOutlined className=" text-white" />
          </div>
          <div className="flex flex-col">
           
            <Title level={3} className="!m-0 !p-0 text-[#0052CC] ">
            Cajeros / dashboard
            </Title>
          </div>
        </div>

        <Button
          onClick={() => navigate('/index/terceros/cajeros/nuevo')}
          type="button"
          className="flex items-center justify-center gap-2 p-4  bg-[#0052CC] border border-[#0052CC] text-white "

        >

          Nuevo Cajero
        </Button>

      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Total de Cajeros"
              value={stats.totalCashiers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#0052CC ' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Comisión Promedio"
              value={stats.avgCommission}
              precision={2}
              prefix={<PercentageOutlined />}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Cajeros Activos"
              value={stats.activeCashiers}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#0052CC ' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table Section */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="mb-0">
            Lista de Cajeros
          </Title>
        </div>

        <CashierTable
          cashiers={cashiers}
          onDelete={handleDelete}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default CashiersPage;