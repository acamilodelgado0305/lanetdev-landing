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

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => ((a.nombre || '') > (b.nombre || '') ? 1 : -1),
      render: (text) => text || '-'
    },
    {
      title: 'Responsable',
      dataIndex: 'responsable',
      key: 'responsable',
      sorter: (a, b) => a.responsable.localeCompare(b.responsable),
    },
    {
      title: 'Municipio',
      dataIndex: 'municipio',
      key: 'municipio',
      sorter: (a, b) => a.municipio.localeCompare(b.municipio),
    },
    {
      title: 'Dirección',
      dataIndex: 'direccion',
      key: 'direccion',
    },
    {
      title: 'Comisión %',
      dataIndex: 'comision_porcentaje',
      key: 'comision_porcentaje',
      render: (value) => (value ? `${value}%` : '-'),
      sorter: (a, b) => parseFloat(a.comision_porcentaje) - parseFloat(b.comision_porcentaje),
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      render: (activo) => (
        <span style={{ color: activo ? '#52c41a' : '#f5222d' }}>
          {activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    }
  ];

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

  const handleDelete = async (id) => {
    try {
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
        const response = await fetch(`${import.meta.env.VITE_API_FINANZAS}/cashiers/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        Swal.fire('Eliminado', 'El cajero ha sido eliminado', 'success');
        fetchCashiers();
      }
    } catch (error) {
      console.error('Error al eliminar el cajero:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el cajero. Por favor, intente de nuevo.',
      });
    }
  };

  return (
    <div className="p-6 w-full mx-auto">
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-green-400 p-2 rounded">
            <FileTextOutlined  className=" text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-green-400 text-sm">Cajeros /</span>
            <Title level={3} className="!m-0 !p-0">
              Dashboard
            </Title>
          </div>
        </div>
        <Button
          type="default"
          icon={<PlusOutlined />}
          onClick={() => navigate('/index/terceros/cajeros/nuevo')}
          className="border-blue-500 border text-blue-500 p-2 hover:bg-blue-500 hover:text-white hover:border-blue-500"
        >
          Crer Cajero
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
              valueStyle={{ color: '#3f8600' }}
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
              valueStyle={{ color: '#1890ff' }}
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