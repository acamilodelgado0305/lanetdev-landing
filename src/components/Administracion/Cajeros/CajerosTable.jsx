import React, { useState, useEffect } from 'react';
import { Table, Input, Drawer, Button, Typography } from 'antd';

const { Title } = Typography;

const CashierTable = ({ onDelete, cashiers = [], loading = false }) => {
  const [searchText, setSearchText] = useState({});
  const [selectedCashier, setSelectedCashier] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Actualizar los datos filtrados cuando cambian los cajeros o el texto de búsqueda
    if (Array.isArray(cashiers)) {
      const filtered = cashiers.filter((cashier) =>
        Object.keys(searchText).every((key) =>
          cashier && cashier[key]
            ? cashier[key].toString().toLowerCase().includes(searchText[key] || '')
            : true
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [cashiers, searchText]);

  const handleSearch = (value, dataIndex) => {
    setSearchText(prev => ({
      ...prev,
      [dataIndex]: value.toLowerCase(),
    }));
  };

  const openDrawer = (cashier) => {
    setSelectedCashier(cashier);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCashier(null);
  };

  const columns = [
    {
      title: (
        <div className="flex flex-col" style={{ margin: '-4px 0', gap: 1, lineHeight: 1 }}>
          Nombre
          <Input
            placeholder="Buscar"
            onChange={(e) => handleSearch(e.target.value, 'nombre')}
            style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
          />
        </div>
      ),
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => (a.nombre || '').localeCompare(b.nombre || ''),
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: '-4px 0', gap: 1, lineHeight: 1 }}>
          Responsable
          <Input
            placeholder="Buscar"
            onChange={(e) => handleSearch(e.target.value, 'responsable')}
            style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
          />
        </div>
      ),
      dataIndex: 'responsable',
      key: 'responsable',
      sorter: (a, b) => (a.responsable || '').localeCompare(b.responsable || ''),
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: '-4px 0', gap: 1, lineHeight: 1 }}>
          Municipio
          <Input
            placeholder="Buscar"
            onChange={(e) => handleSearch(e.target.value, 'municipio')}
            style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
          />
        </div>
      ),
      dataIndex: 'municipio',
      key: 'municipio',
      sorter: (a, b) => (a.municipio || '').localeCompare(b.municipio || ''),
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: '-4px 0', gap: 1, lineHeight: 1 }}>
          Dirección
          <Input
            placeholder="Buscar"
            onChange={(e) => handleSearch(e.target.value, 'direccion')}
            style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
          />
        </div>
      ),
      dataIndex: 'direccion',
      key: 'direccion',
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: '-4px 0', gap: 1, lineHeight: 1 }}>
          Comisión %
          <Input
            placeholder="Buscar"
            onChange={(e) => handleSearch(e.target.value, 'comision_porcentaje')}
            style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
          />
        </div>
      ),
      dataIndex: 'comision_porcentaje',
      key: 'comision_porcentaje',
      render: (value) => (value ? `${value}%` : '-'),
      sorter: (a, b) => (a.comision_porcentaje || 0) - (b.comision_porcentaje || 0),
    }
  ];

  const CashierDetailDrawer = ({ cashier }) => (
    <div className="p-4">
      <Title level={4}>Detalles del Cajero</Title>
      <div className="space-y-4">
        <div>
          <p className="font-bold">Nombre:</p>
          <p>{cashier.nombre || '-'}</p>
        </div>
        <div>
          <p className="font-bold">Responsable:</p>
          <p>{cashier.responsable || '-'}</p>
        </div>
        <div>
          <p className="font-bold">Municipio:</p>
          <p>{cashier.municipio || '-'}</p>
        </div>
        <div>
          <p className="font-bold">Dirección:</p>
          <p>{cashier.direccion || '-'}</p>
        </div>
        <div>
          <p className="font-bold">Porcentaje de Comisión:</p>
          <p>{cashier.comision_porcentaje ? `${cashier.comision_porcentaje}%` : '-'}</p>
        </div>
        <div>
          <p className="font-bold">Observaciones:</p>
          <p>{cashier.observaciones || 'Sin observaciones'}</p>
        </div>
      </div>
      <div className="mt-8 space-x-4">
        <Button type="primary" danger onClick={() => onDelete?.(cashier.id)}>
          Eliminar
        </Button>
        <Button onClick={closeDrawer}>Cerrar</Button>
      </div>
    </div>
  );

  return (
    <>
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey={(record) => record.id || Math.random()}
        pagination={{ pageSize: 10 }}
        bordered
        loading={loading}
        onRow={(record) => ({
          onClick: () => openDrawer(record),
        })}
        rowClassName="clickable-row"
      />
      <style>
        {`
          .ant-table-cell {
            padding: 8px !important;
            font-size: 14px;
          }

          .compact-row {
            height: 24px !important;
          }

          .clickable-row {
            cursor: pointer;
          }
        `}
      </style>
      <Drawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        placement="right"
        width={420}
      >
        {selectedCashier && <CashierDetailDrawer cashier={selectedCashier} />}
      </Drawer>
    </>
  );
};

export default CashierTable;