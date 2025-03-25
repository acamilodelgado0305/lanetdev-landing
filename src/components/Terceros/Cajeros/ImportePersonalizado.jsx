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
  const [columnWidths] = useState({
    product: 200,
    action: 120,
    value: 150,
    actionButton: 50
  });

  const [total, setTotal] = useState(0);

  useEffect(() => {
    const calculatedTotal = items.reduce((acc, item) => {
      const value = parseFloat(item.value) || 0;
      return item.action === 'suma' ? acc + value : acc - value;
    }, 0);

    setTotal(calculatedTotal);
    if (onTotalsChange) {
      onTotalsChange({ total: calculatedTotal });
    }
  }, [items, onTotalsChange]);

  const handleAddRow = () => {
    const newKey = `${Date.now()}-${Math.random()}`;
    const newItem = {
      key: newKey,
      product: '', // Permitimos cadena vacía, pero podrías requerir un valor
      action: 'suma',
      value: 0,
    };
    onItemsChange([...items, newItem]);
  };

  const handleDeleteRow = (key) => {
    if (items.length > 1) {
      onItemsChange(items.filter(item => item.key !== key));
    }
  };

  const handleValueChange = (key, field, value) => {
    const updatedItems = items.map(item => {
      if (item.key === key) {
        if (field === 'value') {
          // Limpiar caracteres no numéricos y convertir a número
          const cleanValue = value.replace(/[^0-9]/g, '');
          const numericValue = cleanValue ? parseFloat(cleanValue) : 0;
          return { ...item, [field]: numericValue };
        }
        // Asegurarse de que product no sea undefined
        if (field === 'product' && !value) {
          return { ...item, [field]: '' };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    console.log("Updated items en ImportePersonalizado:", JSON.stringify(updatedItems, null, 2));
    onItemsChange(updatedItems);
  };

  const columns = [
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
      title: 'Descripción',
      dataIndex: 'product',
      width: columnWidths.product,
      render: (text, record) => (
        <Input
          value={text || ''} // Asegurar que siempre haya un valor
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'product', e.target.value)}
          placeholder="Ej: Venta de productos"
        />
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

  const renderSummary = () => (
    <div style={{ marginTop: '16px', width: '100%', marginLeft: 'auto' }}>
      <div style={{ border: '1px solid #f0f0f0', padding: '16px' }}>
        <div className="bg-[#0052CC] text-white rounded-md py-2 px-4 flex justify-between items-center">
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Total:</div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{formatCurrency(total)}</div>
        </div>
      </div>
    </div>
  );

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