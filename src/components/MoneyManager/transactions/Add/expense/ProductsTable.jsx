import React, { useState, useEffect } from 'react';
import { Table, Select, Input, Button, Divider, Checkbox } from 'antd';
import { getCategorias } from '../../../../../services/moneymanager/moneyService';
import { DeleteOutlined } from '@ant-design/icons';
import AccountSelector from '../AccountSelector';

// Función para formatear valores en formato colombiano con decimales (para cálculos)
const formatCurrency = (value) => {
  if (value === '' || isNaN(parseFloat(value))) {
    return '$0,00';
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Función para normalizar entrada del usuario (convierte 75.730,25 a 75730.25)
export const parseColombianNumber = (value) => {
  if (!value || value === '') return 0;
  const cleanedValue = value.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleanedValue);
  return isNaN(parsed) ? 0 : parsed;
};

// Función para formatear la entrada con separadores de miles y decimales
const formatColombianInput = (value, finalize = false) => {
  if (!value || value === '') return '';
  // Limpiar la entrada, permitir solo números, una coma y puntos
  let cleanedValue = value.replace(/[^0-9,]/g, '');
  // Separar parte entera y decimal
  const parts = cleanedValue.split(',');
  let integerPart = parts[0].replace(/\./g, '');
  const decimalPart = parts[1] || '';

  // Formatear parte entera con puntos cada tres dígitos
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Si finalize es true, completar los decimales a 2 dígitos
  if (finalize) {
    const formattedDecimal = decimalPart.padEnd(2, '0').slice(0, 2);
    return decimalPart || parts.length > 1 ? `${integerPart},${formattedDecimal}` : `${integerPart},00`;
  }

  // Durante la escritura, permitir decimales parciales
  return decimalPart || parts.length > 1 ? `${integerPart},${decimalPart}` : integerPart;
};

const ProductsTable = ({
  items,
  onItemsChange,
  onHiddenDetailsChange,
  onTotalsChange,
  accounts,
  selectedAccount,
  onAccountSelect,
}) => {
  const [hasPercentageDiscount, setHasPercentageDiscount] = useState(true);
  const [hiddenDetails, setHiddenDetails] = useState(false);
  const [hiddenImpuestos, setHiddenImpuestos] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [totals, setTotals] = useState({
    totalBruto: 0,
    descuentos: 0,
    subtotal: 0,
    iva: 0,
    retencion: 0,
    totalNeto: 0,
    ivaPercentage: '0',
    retencionPercentage: '0',
    totalImpuestos: 0,
  });

  const [columnWidths] = useState({
    categoria: 120,
    product: 150,
    quantity: 100,
    unitPrice: 120,
    discount: 50,
    taxCharge: 120,
    taxWithholding: 120,
    total: 120,
    action: 20,
  });

  // Agregar ítem vacío al cargar si no hay ítems
  useEffect(() => {
    if (items.length === 0) {
      const newKey = `${Date.now()}-${Math.random()}`;
      const newItem = {
        key: newKey,
        provider: '',
        product: '',
        quantity: 1,
        unitPrice: '',
        purchaseValue: 0,
        discount: 0,
        taxCharge: 0,
        taxWithholding: 0,
        total: 0,
        categoria: '',
      };
      onItemsChange([newItem]);
    }
  }, [items, onItemsChange]);

  // Cargar categorías
  useEffect(() => {
    const ObtenerCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(data);
      } catch (err) {
        console.error('Error al cargar las categorías:', err);
      }
    };
    ObtenerCategorias();
  }, []);

  // Notificar cambios en hiddenDetails
  useEffect(() => {
    if (onHiddenDetailsChange) {
      onHiddenDetailsChange(hiddenDetails);
    }
  }, [hiddenDetails, onHiddenDetailsChange]);

  // Calcular el total de un ítem
  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseColombianNumber(item.unitPrice);
    const discount = parseFloat(item.discount) || 0;
    const taxCharge = hiddenImpuestos ? 0 : parseFloat(item.taxCharge) || 0;
    const taxWithholding = hiddenImpuestos ? 0 : parseFloat(item.taxWithholding) || 0;

    const itemBruto = quantity * unitPrice;
    const discountAmount = hasPercentageDiscount
      ? itemBruto * (discount / 100)
      : discount;
    const itemSubtotal = itemBruto - discountAmount;
    const taxChargeAmount = itemSubtotal * (taxCharge / 100);
    const taxWithholdingAmount = itemSubtotal * (taxWithholding / 100);

    return itemSubtotal + taxChargeAmount - taxWithholdingAmount;
  };

  // Calcular totales generales
  useEffect(() => {
    const newTotals = items.reduce(
      (acc, item) => {
        const totalItem = calculateItemTotal(item);
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseColombianNumber(item.unitPrice);
        const discount = parseFloat(item.discount) || 0;

        const itemBruto = quantity * unitPrice;
        const itemDiscount = hasPercentageDiscount
          ? itemBruto * (discount / 100)
          : discount;

        acc.totalBruto += itemBruto;
        acc.descuentos += itemDiscount;

        return acc;
      },
      {
        totalBruto: 0,
        descuentos: 0,
      }
    );

    const subtotal = newTotals.totalBruto - newTotals.descuentos;
    const iva = hiddenImpuestos
      ? subtotal * (parseFloat(totals.ivaPercentage) / 100)
      : items.reduce((acc, item) => {
          const quantity = parseFloat(item.quantity) || 0;
          const unitPrice = parseColombianNumber(item.unitPrice);
          const discount = parseFloat(item.discount) || 0;
          const taxCharge = parseFloat(item.taxCharge) || 0;

          const bruto = quantity * unitPrice;
          const discountAmount = hasPercentageDiscount
            ? bruto * (discount / 100)
            : discount;
          const subtotalItem = bruto - discountAmount;
          return acc + subtotalItem * (taxCharge / 100);
        }, 0);
    const retencion = hiddenImpuestos
      ? subtotal * (parseFloat(totals.retencionPercentage) / 100)
      : items.reduce((acc, item) => {
          const quantity = parseFloat(item.quantity) || 0;
          const unitPrice = parseColombianNumber(item.unitPrice);
          const discount = parseFloat(item.discount) || 0;
          const taxWithholding = parseFloat(item.taxWithholding) || 0;

          const bruto = quantity * unitPrice;
          const discountAmount = hasPercentageDiscount
            ? bruto * (discount / 100)
            : discount;
          const subtotalItem = bruto - discountAmount;
          return acc + subtotalItem * (taxWithholding / 100);
        }, 0);

    const totalNeto = subtotal + iva - retencion;
    const totalImpuestos = iva + retencion;

    const updatedTotals = {
      totalBruto: newTotals.totalBruto,
      descuentos: newTotals.descuentos,
      subtotal: subtotal,
      iva: iva,
      retencion: retencion,
      totalNeto: totalNeto,
      ivaPercentage: totals.ivaPercentage,
      retencionPercentage: totals.retencionPercentage,
      totalImpuestos: totalImpuestos,
    };

    setTotals(updatedTotals);
    if (onTotalsChange) {
      onTotalsChange(updatedTotals);
    }
  }, [items, hasPercentageDiscount, totals.ivaPercentage, totals.retencionPercentage, hiddenImpuestos, onTotalsChange]);

  const handleAddRow = () => {
    const newKey = `${Date.now()}-${Math.random()}`;
    const newItem = {
      key: newKey,
      provider: '',
      product: '',
      quantity: 1,
      unitPrice: '',
      purchaseValue: 0,
      discount: 0,
      taxCharge: 0,
      taxWithholding: 0,
      total: 0,
      categoria: '',
    };
    onItemsChange([...items, newItem]);
  };

  const handleDeleteRow = (key) => {
    if (items.length > 1) {
      onItemsChange(items.filter((item) => item.key !== key));
    }
  };

  const handleValueChange = (key, field, value, finalize = false) => {
    console.log(`handleValueChange - key: ${key}, field: ${field}, value: ${value}, finalize: ${finalize}`);
    const updatedItems = items.map((item) => {
      if (item.key === key) {
        const updatedItem = { ...item };
        if (field === 'unitPrice') {
          // Formatear el valor con separadores de miles y decimales
          const formattedValue = formatColombianInput(value, finalize);
          updatedItem[field] = formattedValue;
          console.log(`unitPrice raw: ${value}, formatted: ${formattedValue}, parsed: ${parseColombianNumber(formattedValue)}`);
          updatedItem.total = calculateItemTotal(updatedItem);
        } else {
          updatedItem[field] = value;
          updatedItem.total = calculateItemTotal(updatedItem);
        }
        return updatedItem;
      }
      return item;
    });

    console.log('updatedItems:', updatedItems);
    onItemsChange(updatedItems);
  };

  const handleRetentionChange = (type, value) => {
    setTotals((prev) => ({
      ...prev,
      [`${type}Percentage`]: value,
    }));
  };

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
          placeholder="Buscar"
        />
      ),
    },
    {
      title: 'Cant',
      dataIndex: 'quantity',
      width: columnWidths.quantity,
      render: (text, record) => (
        <Input
          type="number"
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'quantity', e.target.value)}
        />
      ),
    },
    {
      title: 'Valor Unitario',
      dataIndex: 'unitPrice',
      width: columnWidths.unitPrice,
      render: (text, record) => (
        <Input
          type="text"
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'unitPrice', e.target.value)}
          onBlur={(e) => handleValueChange(record.key, 'unitPrice', e.target.value, true)}
          placeholder="$0,00"
        />
      ),
    },
    {
      title: 'Descuento',
      dataIndex: 'discount',
      width: columnWidths.discount,
      render: (text, record) => (
        <Input
          type="number"
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'discount', e.target.value)}
          suffix={hasPercentageDiscount ? '%' : ''}
        />
      ),
    },
    ...(!hiddenImpuestos
      ? [
          {
            title: 'Impuesto Cargo',
            dataIndex: 'taxCharge',
            width: columnWidths.taxCharge,
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
            ),
          },
          {
            title: 'Impuesto Retención',
            dataIndex: 'taxWithholding',
            width: columnWidths.taxWithholding,
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
            ),
          },
        ]
      : []),
    {
      title: 'Valor Total',
      dataIndex: 'total',
      width: columnWidths.total,
      render: (text) => formatCurrency(text),
    },
    ...(hiddenDetails
      ? [
          {
            title: 'Categoría',
            dataIndex: 'categoria',
            width: columnWidths.categoria,
            render: (text, record) => {
              const usedCategories = items
                .filter((item) => item.key !== record.key)
                .map((item) => item.categoria);
              const availableCategorias = categorias.filter(
                (cat) => !usedCategories.includes(cat.name)
              );

              return (
                <Select
                  value={record.categoria}
                  onChange={(value) => handleValueChange(record.key, 'categoria', value)}
                  style={{ width: '100%' }}
                  placeholder="Selecciona una categoría"
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          padding: '8px',
                          cursor: 'pointer',
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          console.log('Redirigiendo a crear categoría...');
                        }}
                      >
                        Crear categoría
                      </div>
                    </div>
                  )}
                >
                  {availableCategorias.map((cat) => (
                    <Select.Option key={cat.id} value={cat.name}>
                      {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              );
            },
          },
        ]
      : []),
    {
      title: '',
      key: 'action',
      width: columnWidths.action,
      render: (_, record) => (
        <DeleteOutlined onClick={() => handleDeleteRow(record.key)} />
      ),
    },
  ];

  const renderSummary = () => {
    return (
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        <div className="pt-2" style={{ width: '45%' }}>
          <label className="text-xl font-semibold text-sm block mb-2">
            ¿De dónde salió la plata?
          </label>
          <AccountSelector
            selectedAccount={selectedAccount}
            onAccountSelect={onAccountSelect}
            accounts={accounts}
          />
        </div>
        <div style={{ width: '45%', maxWidth: '400px' }}>
          <div style={{ border: '1px solid #f0f0f0', padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>
                Total Bruto:
              </div>
              <div style={{ textAlign: 'right', fontWeight: 500 }}>
                {formatCurrency(totals.totalBruto)}
              </div>
              <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>
                Descuentos:
              </div>
              <div style={{ textAlign: 'right', color: '#ff4d4f' }}>
                -{formatCurrency(totals.descuentos)}
              </div>
              <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>
                Subtotal:
              </div>
              <div style={{ textAlign: 'right', fontWeight: 500 }}>
                {formatCurrency(totals.subtotal)}
              </div>
              {!hiddenImpuestos && (
                <>
                  <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>
                    Retefuente:
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 500 }}>
                    {formatCurrency(totals.retencion)}
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>
                    IVA:
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 500 }}>
                    {formatCurrency(totals.iva)}
                  </div>
                </>
              )}
              {hiddenImpuestos && (
                <>
                  <div
                    style={{
                      textAlign: 'right',
                      fontWeight: 500,
                      color: '#666',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>IVA:</span>
                    <Select
                      value={totals.ivaPercentage}
                      style={{ width: '120px' }}
                      onChange={(value) => handleRetentionChange('iva', value)}
                    >
                      <Select.Option value="19">IVA 19%</Select.Option>
                      <Select.Option value="5">IVA 5%</Select.Option>
                      <Select.Option value="0">IVA 0%</Select.Option>
                      <Select.Option value="8">Ipoconsumo 8%</Select.Option>
                    </Select>
                  </div>
                  <div style={{ textAlign: 'right', color: '#ff4d4f' }}>
                    {formatCurrency(totals.iva)}
                  </div>
                  <div
                    style={{
                      textAlign: 'right',
                      fontWeight: 500,
                      color: '#666',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>Retención:</span>
                    <Select
                      value={totals.retencionPercentage}
                      style={{ width: '120px' }}
                      onChange={(value) => handleRetentionChange('retencion', value)}
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
                  </div>
                  <div style={{ textAlign: 'right', color: '#ff4d4f' }}>
                    -{formatCurrency(totals.retencion)}
                  </div>
                </>
              )}
            </div>
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '8px' }}>
              <div className="bg-[#0052CC] text-white rounded-md py-2 px-4 flex justify-between items-center">
                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>
                  Total:
                </div>
                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>
                  {formatCurrency(totals.totalNeto)}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>
                  Total en Impuestos:
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    fontWeight: 500,
                    color: totals.totalImpuestos >= 0 ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {totals.totalImpuestos >= 0 ? '+' : ''}
                  {formatCurrency(totals.totalImpuestos)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOptions = () => {
    return (
      <div style={{ marginBottom: '16px' }}>
        <Checkbox
          checked={hasPercentageDiscount}
          onChange={(e) => setHasPercentageDiscount(e.target.checked)}
        >
          Descuento en porcentaje
        </Checkbox>
        <Checkbox
          checked={hiddenDetails}
          onChange={(e) => setHiddenDetails(e.target.checked)}
        >
          Mostrar detalles (categorías)
        </Checkbox>
        <Checkbox
          checked={!hiddenImpuestos}
          onChange={(e) => setHiddenImpuestos(!e.target.checked)}
        >
          Incluir impuestos por producto
        </Checkbox>
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {renderOptions()}
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

export default ProductsTable;