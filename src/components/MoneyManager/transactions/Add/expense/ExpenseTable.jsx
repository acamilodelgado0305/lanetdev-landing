import React, { useState, useEffect } from 'react';
import { Table, Select, Input, Button } from 'antd';

const NewExpenseTable = ({
  hasProviderPerItem = false,
  hasIncludedTax = false,
  hasPercentageDiscount = false
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

    let itemTotal = quantity * unitPrice;

    // Aplicar descuento
    if (hasPercentageDiscount) {
      itemTotal -= itemTotal * (discount / 100);
    } else {
      itemTotal -= discount;
    }

    // Aplicar impuestos
    const taxCharge = parseFloat(item.taxCharge) || 0;
    itemTotal += itemTotal * (taxCharge / 100);

    return itemTotal;
  };

  useEffect(() => {
    // Calcular totales basados en todos los items
    const itemTotals = items.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const discount = parseFloat(item.discount) || 0;

      // Calcular subtotal por ítem
      const itemSubtotal = quantity * unitPrice;

      // Calcular descuento por ítem
      const itemDiscount = hasPercentageDiscount ?
        itemSubtotal * (discount / 100) :
        discount;

      // Acumular totales
      acc.totalBruto += itemSubtotal;
      acc.descuentos += itemDiscount;

      return acc;
    }, {
      totalBruto: 0,
      descuentos: 0
    });

    // Calcular subtotal general
    const subtotal = itemTotals.totalBruto - itemTotals.descuentos;

    // Calcular retenciones
    const reteIVA = (subtotal * parseFloat(totals.reteIVAPercentage)) / 100;
    const reteICA = (subtotal * parseFloat(totals.reteICAPercentage)) / 100;

    // Calcular total neto
    const totalNeto = subtotal - reteIVA - reteICA;

    setTotals({
      ...totals,
      totalBruto: itemTotals.totalBruto,
      descuentos: itemTotals.descuentos,
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
    setItems(items.filter(item => item.key !== key));
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

  // Base columns that are always present
  let columns = [
    {
      title: '# Tipo',
      dataIndex: 'type',
      width: 120,
      render: (text, record) => (
        <Select
          value={text}
          className="w-full"
          onChange={(value) => handleValueChange(record.key, 'type', value)}
        >
          <Select.Option value="Producto">Producto</Select.Option>
          <Select.Option value="Activo">Activo</Select.Option>
             <Select.Option value="Gasto">Gasto</Select.Option>
        </Select>
      )
    }
  ];

  // Add provider column if hasProviderPerItem is true
  if (hasProviderPerItem) {
    columns.push({
      title: 'Proveedor',
      dataIndex: 'provider',
      width: 150,
      render: (text, record) => (
        <Select
          value={text}
          className="w-full"
          onChange={(value) => handleValueChange(record.key, 'provider', value)}
        >
          <Select.Option value="proveedor1">Proveedor 1</Select.Option>
          <Select.Option value="proveedor2">Proveedor 2</Select.Option>
          <Select.Option value="proveedor3">Proveedor 3</Select.Option>
        </Select>
      )
    });
  }

  // Add remaining standard columns
  columns = [
    ...columns,
    {
      title: 'Producto',
      dataIndex: 'product',
      width: 150,
      render: (text, record) => (
        <Input
          value={text}
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
          onChange={(e) => handleValueChange(record.key, 'unitPrice', e.target.value)}
        />
      )
    }
  ];

  // Add purchase value column if hasIncludedTax is true
  if (hasIncludedTax) {
    columns.push({
      title: 'Valor Compra',
      dataIndex: 'purchaseValue',
      width: 120,
      render: (text, record) => (
        <Input
          type="number"
          value={text}
          onChange={(e) => handleValueChange(record.key, 'purchaseValue', e.target.value)}
        />
      )
    });
  }

  // Add discount column with appropriate rendering based on hasPercentageDiscount
  columns.push({
    title: 'Descuento',
    dataIndex: 'discount',
    width: 120,
    render: (text, record) => (
      <Input
        type="number"
        value={text}
        onChange={(e) => handleValueChange(record.key, 'discount', e.target.value)}
        suffix={hasPercentageDiscount ? '%' : ''}
      />
    )
  });

  // Add remaining columns
  columns = [
    ...columns,
    {
      title: 'Impuesto Cargo',
      dataIndex: 'taxCharge',
      width: 120,
      render: (text, record) => (
        <Select
          value={text}
          className="w-full"
          onChange={(value) => handleValueChange(record.key, 'taxCharge', value)}
        >
          <Select.Option value="0">0%</Select.Option>
          <Select.Option value="19">19%</Select.Option>
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
          className="w-full"
          onChange={(value) => handleValueChange(record.key, 'taxWithholding', value)}
        >
          <Select.Option value="0">0%</Select.Option>
          <Select.Option value="4">4%</Select.Option>
          <Select.Option value="11">11%</Select.Option>
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
          className="text-red-500 hover:text-red-700"
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
    <div className="mt-6">
      <Table
        dataSource={items}
        columns={columns}
        pagination={false}
        scroll={{ x: 'max-content' }}
        footer={() => (
          <Button
            onClick={handleAddRow}
            type="dashed"
            className="w-full"
          >
            + Agregar línea
          </Button>
        )}
      />

      <div className="mt-4 w-full max-w-md ml-auto">
        <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="text-right font-medium text-gray-600">Total Bruto:</div>
            <div className="text-right font-medium">{formatCurrency(totals.totalBruto)}</div>

            <div className="text-right font-medium text-gray-600">Descuentos:</div>
            <div className="text-right text-red-600">-{formatCurrency(totals.descuentos)}</div>

            <div className="text-right font-medium text-gray-600">Subtotal:</div>
            <div className="text-right font-medium">{formatCurrency(totals.subtotal)}</div>

            <div className="text-right font-medium text-gray-600 flex items-center justify-end">
              <span className="mr-2">ReteIVA:</span>
              <Select
                value={totals.reteIVAPercentage}
                style={{ width: 80 }}
                onChange={(value) => handleRetentionChange('reteIVA', value)}
              >
                <Select.Option value="0">0%</Select.Option>
                <Select.Option value="15">15%</Select.Option>
                <Select.Option value="19">19%</Select.Option>
              </Select>
            </div>
            <div className="text-right text-red-600">-{formatCurrency(totals.reteIVA)}</div>

            <div className="text-right font-medium text-gray-600 flex items-center justify-end">
              <span className="mr-2">ReteICA:</span>
              <Select
                value={totals.reteICAPercentage}
                style={{ width: 80 }}
                onChange={(value) => handleRetentionChange('reteICA', value)}
              >
                <Select.Option value="0">0%</Select.Option>
                <Select.Option value="4">4%</Select.Option>
                <Select.Option value="11">11%</Select.Option>
              </Select>
            </div>
            <div className="text-right text-red-600">-{formatCurrency(totals.reteICA)}</div>
          </div>

          <div className="border-t pt-2 mt-2">
            <div className="grid grid-cols-2 gap-x-4">
              <div className="text-right font-bold text-lg">Total Neto:</div>
              <div className="text-right font-bold text-lg">{formatCurrency(totals.totalNeto)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewExpenseTable;