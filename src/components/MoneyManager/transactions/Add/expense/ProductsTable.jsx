import React, { useState, useEffect } from 'react';
import { Table, Select, Input, Button } from 'antd';

const NewExpenseTable = ({
  hasPercentageDiscount = false,
  onDataChange, // New prop to communicate changes up
}) => {
  const [items, setItems] = useState([{
    key: '1',
    type: 'Gasto',
    provider: '',
    product: '',
    description: '',
    quantity: 1.00,
    unitPrice: 0.00,
    purchaseValue: 0.00,
    discount: 0.00,
    taxCharge: 0.00,
    taxWithholding: 0.00,
    total: 0.00
  }]);

  const [totals, setTotals] = useState({
    totalBruto: 0,
    descuentos: 0,
    subtotal: 0,
    reteIVA: 0,
    reteICA: 0,
    totalNeto: 0,
    reteIVAPercentage: "0",
    reteICAPercentage: "0"
  });

  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const discount = parseFloat(item.discount) || 0;
    const taxCharge = parseFloat(item.taxCharge) || 0;
    const taxWithholding = parseFloat(item.taxWithholding) || 0;

    // Calcular valor bruto
    let itemSubtotal = quantity * unitPrice;

    // Aplicar descuento
    const discountAmount = hasPercentageDiscount
      ? itemSubtotal * (discount / 100)
      : discount;

    itemSubtotal -= discountAmount;

    // Aplicar impuesto cargo (IVA)
    const taxChargeAmount = itemSubtotal * (taxCharge / 100);

    // Aplicar retención
    const taxWithholdingAmount = itemSubtotal * (taxWithholding / 100);

    // Total final
    return itemSubtotal + taxChargeAmount - taxWithholdingAmount;
  };

  // En NewExpenseTable, actualiza el useEffect:
  useEffect(() => {
    if (onDataChange) {
      const validItems = items.filter(item =>
        item.product !== '' ||
        item.description !== '' ||
        item.unitPrice > 0 ||
        item.quantity > 0
      );

      onDataChange({
        items: validItems,
        totals
      });
    }
  }, [items, totals]);
  useEffect(() => {
    const newTotals = items.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const discount = parseFloat(item.discount) || 0;

      // Valor bruto por ítem
      const itemBruto = quantity * unitPrice;

      // Descuento por ítem
      const itemDiscount = hasPercentageDiscount
        ? itemBruto * (discount / 100)
        : discount;

      acc.totalBruto += itemBruto;
      acc.descuentos += itemDiscount;

      return acc;
    }, {
      totalBruto: 0,
      descuentos: 0
    });

    // Subtotal después de descuentos
    const subtotal = newTotals.totalBruto - newTotals.descuentos;

    // Calcular retenciones
    const reteIVA = subtotal * (parseFloat(totals.reteIVAPercentage) / 100);
    const reteICA = subtotal * (parseFloat(totals.reteICAPercentage) / 100);

    // Total neto final
    const totalNeto = subtotal - reteIVA - reteICA;

    setTotals({
      ...totals,
      totalBruto: newTotals.totalBruto,
      descuentos: newTotals.descuentos,
      subtotal: subtotal,
      reteIVA: reteIVA,
      reteICA: reteICA,
      totalNeto: totalNeto
    });
  }, [items, hasPercentageDiscount, totals.reteIVAPercentage, totals.reteICAPercentage]);

  const handleAddRow = () => {
    const newKey = (items.length + 1).toString();
    setItems([...items, {
      key: newKey,
      type: 'Gasto',
      provider: '',
      product: '',
      description: '',
      quantity: 1.00,
      unitPrice: 0.00,
      purchaseValue: 0.00,
      discount: 0.00,
      taxCharge: 0.00,
      taxWithholding: 0.00,
      total: 0.00
    }]);
  };

  const handleDeleteRow = (key) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.key !== key));
    }
  };

  const handleValueChange = (key, field, value) => {
    setItems(items.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.total = calculateItemTotal(updatedItem);
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRetentionChange = (type, value) => {
    setTotals(prev => ({
      ...prev,
      [`${type}Percentage`]: value
    }));
  };

  const columns = [
    {
      title: '# Tipo',
      dataIndex: 'type',
      width: 120,
      render: (text, record) => (
        <Select
          value={text}
          style={{ width: '100%' }}
          onChange={(value) => handleValueChange(record.key, 'type', value)}
        >
          <Select.Option value="Producto">Producto</Select.Option>
          <Select.Option value="Activo">Activo</Select.Option>
          <Select.Option value="Gasto">Gasto</Select.Option>
        </Select>
      )
    },
    {
      title: 'Producto',
      dataIndex: 'product',
      width: 150,
      render: (text, record) => (
        <Input
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'product', e.target.value)}
          placeholder="Buscar"
        />
      )
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      render: (text, record) => (
        <Input
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'description', e.target.value)}
        />
      )
    },
    {
      title: 'Cant',
      dataIndex: 'quantity',
      width: 100,
      render: (text, record) => (
        <Input
          type="number"
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'quantity', e.target.value)}
        />
      )
    },
    {
      title: 'Valor Unitario',
      dataIndex: 'unitPrice',
      width: 120,
      render: (text, record) => (
        <Input
          type="number"
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'unitPrice', e.target.value)}
        />
      )
    },
    {
      title: 'Descuento',
      dataIndex: 'discount',
      width: 120,
      render: (text, record) => (
        <Input
          type="number"
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'discount', e.target.value)}
          suffix={hasPercentageDiscount ? '%' : ''}
        />
      )
    },
    {
      title: 'Impuesto Cargo',
      dataIndex: 'taxCharge',
      width: 120,
      render: (text, record) => (
        <Select
          value={text}
          style={{ width: '100%' }}
          onChange={(value) => handleValueChange(record.key, 'taxCharge', value)}
        >
          <Select.Option value="19">IVA 19%</Select.Option>
          <Select.Option value="5">IVA 5%</Select.Option>
          <Select.Option value="0">IVA 0%</Select.Option>
          <Select.Option value="8">Ipoconsumo 8%</Select.Option>
        </Select>
      )
    },
    {
      title: 'Impuesto Retención',
      dataIndex: 'taxWithholding',
      width: 120,
      render: (text, record) => (
        <Select
          value={text}
          style={{ width: '100%' }}
          onChange={(value) => handleValueChange(record.key, 'taxWithholding', value)}
        >
          <Select.Option value="11">Rete 11%</Select.Option>
          <Select.Option value="10">Rete 10%</Select.Option>
          <Select.Option value="7">Rete 7%</Select.Option>
          <Select.Option value="6">Rete 6%</Select.Option>
          <Select.Option value="4">Rete 4%</Select.Option>
          <Select.Option value="3.5">Rete 3.5%</Select.Option>
          <Select.Option value="2.5">Rete 2.5%</Select.Option>
          <Select.Option value="2">Rete 2%</Select.Option>
          <Select.Option value="1">Rete 1%</Select.Option>
          <Select.Option value="0">Rete 0%</Select.Option>
        </Select>
      )
    },
    {
      title: 'Valor Total',
      dataIndex: 'total',
      width: 120,
      render: (text) => text.toFixed(2)
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          danger
          style={{ width: '100%' }}
          onClick={() => handleDeleteRow(record.key)}
        >
          Eliminar
        </Button>
      )
    }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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

      <div style={{ marginTop: '16px', width: '100%', maxWidth: '400px', marginLeft: 'auto' }}>
        <div style={{ border: '1px solid #f0f0f0', padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Total Bruto:</div>
            <div style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(totals.totalBruto)}</div>

            <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Descuentos:</div>
            <div style={{ textAlign: 'right', color: '#ff4d4f' }}>-{formatCurrency(totals.descuentos)}</div>

            <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Subtotal:</div>
            <div style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(totals.subtotal)}</div>

            <div style={{ textAlign: 'right', fontWeight: 500, color: '#666', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>ReteIVA:</span>
              <Select
                value={totals.reteIVAPercentage}
                style={{ width: '80px' }}
                onChange={(value) => handleRetentionChange('reteIVA', value)}
              >

                <Select.Option value="15">15%</Select.Option>
                <Select.Option value="0">0%</Select.Option>

              </Select>
            </div>
            <div style={{ textAlign: 'right', color: '#ff4d4f' }}>-{formatCurrency(totals.reteIVA)}</div>

            <div style={{ textAlign: 'right', fontWeight: 500, color: '#666', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <span style={{ marginRight: '8px' }}>ReteICA:</span>
              <Select
                value={totals.reteICAPercentage}
                style={{ width: '80px' }}
                onChange={(value) => handleRetentionChange('reteICA', value)}
              >
                <Select.Option value="13.8">13.8%</Select.Option>
                <Select.Option value="11.04">11.04%</Select.Option>
                <Select.Option value="9.66">9.66%</Select.Option>|
                <Select.Option value="8">8%</Select.Option>
                <Select.Option value="7">7%</Select.Option>
                <Select.Option value="6.9">6.9%</Select.Option>
                <Select.Option value="4.14">4.14%</Select.Option>
                <Select.Option value="0">0%</Select.Option>
              </Select>
            </div>
            <div style={{ textAlign: 'right', color: '#ff4d4f' }}>-{formatCurrency(totals.reteICA)}</div>
          </div>
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '8px' }}>
            <div className="bg-[#0052CC] text-white rounded-md py-2 px-4 flex justify-between items-center">
              <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>Total Neto:</div>
              <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>{formatCurrency(totals.totalNeto)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewExpenseTable;