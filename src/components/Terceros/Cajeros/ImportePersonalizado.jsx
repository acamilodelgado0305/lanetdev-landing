import React, { useState, useEffect } from 'react';
import { Table, Select, Input, Button } from 'antd';
import { DeleteOutlined } from "@ant-design/icons";

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);
};

const ImportePersonalizado = ({ items, onItemsChange, onTotalsChange }) => {
  // Estado para los anchos de las columnas
  const [columnWidths, setColumnWidths] = useState({
    product: 200,
    action: 120,
    value: 150,
    actionButton: 50
  });

  // Estado para el total acumulado
  const [total, setTotal] = useState(0);

  // Calcular el total acumulado cada vez que cambian los ítems
  useEffect(() => {
    const calculatedTotal = items.reduce((acc, item) => {
      const value = parseFloat(item.value) || 0;
      return item.action === 'suma' ? acc + value : acc - value;
    }, 0);

    setTotal(calculatedTotal);

    // Notificar al componente padre el total
    if (onTotalsChange) {
      onTotalsChange({ total: calculatedTotal });
    }
  }, [items, onTotalsChange]);

  // Manejar la adición de una nueva fila
  const handleAddRow = () => {
    const newKey = `${Date.now()}-${Math.random()}`;
    const newItem = {
      key: newKey,
      product: '',
      action: 'suma', // Valor por defecto
      value: 0,
    };
    onItemsChange([...items, newItem]);
  };

  // Manejar la eliminación de una fila
  const handleDeleteRow = (key) => {
    if (items.length > 1) {
      onItemsChange(items.filter(item => item.key !== key));
    }
  };

  // Manejar cambios en los valores de los campos
  const handleValueChange = (key, field, value) => {
    const updatedItems = items.map(item => {
      if (item.key === key) {
        if (field === 'value') {
          // Limpiamos el valor de caracteres no numéricos
          const cleanValue = value.replace(/[^0-9]/g, '');
          const numericValue = cleanValue ? parseFloat(cleanValue) : 0;
          return { ...item, [field]: numericValue };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  // Definición de las columnas de la tabla
  const columns = [
    {
      title: 'Producto',
      dataIndex: 'product',
      width: columnWidths.product,
      render: (text, record) => (
        <Input
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'product', e.target.value)}
          placeholder="Nombre del producto"
        />
      )
    },
    {
      title: 'Acción',
      dataIndex: 'action',
      width: columnWidths.action,
      render: (text, record) => (
        <Select
          value={text}
          style={{ width: '100%' }}
          onChange={(value) => handleValueChange(record.key, 'action', value)}
        >
          <Select.Option value="suma">Suma</Select.Option>
          <Select.Option value="resta">Resta</Select.Option>
        </Select>
      )
    },
    {
      title: 'Valor',
      dataIndex: 'value',
      width: columnWidths.value,
      render: (text, record) => (
        <Input
          type="text"
          value={formatCurrency(text)}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'value', e.target.value)}
          placeholder="$0"
        />
      )
    },
    {
      title: '',
      key: 'action',
      width: columnWidths.actionButton,
      render: (_, record) => (
        <DeleteOutlined
          onClick={() => handleDeleteRow(record.key)}
          style={{ color: '#ff4d4f' }}
        />
      )
    }
  ];

  // Renderizar el resumen del total
  const renderSummary = () => {
    return (
      <div style={{ marginTop: '16px', width: '100%', marginLeft: 'auto' }}>
        <div style={{ border: '1px solid #f0f0f0', padding: '16px' }}>
          <div className="bg-[#0052CC] text-white rounded-md py-2 px-4 flex justify-between items-center">
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Total:</div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{formatCurrency(total)}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      <Table
        dataSource={items}
        columns={columns}
        pagination={false}
        size="small"
        bordered
        style={{ width: '100%' }}
      />
      <Button
        onClick={handleAddRow}
        type="dashed"
        style={{ width: '100%', marginTop: '8px' }}
      >
        + Agregar línea
      </Button>
      {renderSummary()}
    </div>
  );
};

export default ImportePersonalizado;