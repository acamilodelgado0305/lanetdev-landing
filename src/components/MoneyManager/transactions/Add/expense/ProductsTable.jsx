import React, { useState, useEffect, useRef } from 'react';
import { Table, Select, Input, Button, Divider, Checkbox } from 'antd';
import { getCategorias } from "../../../../../services/moneymanager/moneyService";
import {
  DeleteOutlined
} from "@ant-design/icons";

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0); // Aseguramos que siempre haya un valor válido
};

const ProductsTable = ({ items, onItemsChange, onHiddenDetailsChange, onTotalsChange }) => {
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
    ivaPercentage: "0",
    retencionPercentage: "0",
    totalImpuestos: 0
  });

  // Estado para los anchos de las columnas
  const [columnWidths, setColumnWidths] = useState({

    categoria: 120,
    product: 150,
    quantity: 100,
    unitPrice: 120,
    discount: 50,
    taxCharge: 120,
    taxWithholding: 120,
    total: 120,
    action: 20
  });



  // Cargar categorías al montar el componente
  useEffect(() => {
    const ObtenerCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(data);
      } catch (err) {
        console.error("Error al cargar las categorías:", err);
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
    const unitPrice = parseFloat(item.unitPrice) || 0;
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

  // Calcular totales generales y notificar al padre
  useEffect(() => {
    const newTotals = items.reduce((acc, item) => {
      const totalItem = calculateItemTotal(item);
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const discount = parseFloat(item.discount) || 0;

      const itemBruto = quantity * unitPrice;
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

    const subtotal = newTotals.totalBruto - newTotals.descuentos;
    const iva = hiddenImpuestos
      ? subtotal * (parseFloat(totals.ivaPercentage) / 100)
      : items.reduce((acc, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const discount = parseFloat(item.discount) || 0;
        const taxCharge = parseFloat(item.taxCharge) || 0;

        const bruto = quantity * unitPrice;
        const discountAmount = hasPercentageDiscount ? bruto * (discount / 100) : discount;
        const subtotalItem = bruto - discountAmount;
        return acc + subtotalItem * (taxCharge / 100);
      }, 0);
    const retencion = hiddenImpuestos
      ? subtotal * (parseFloat(totals.retencionPercentage) / 100)
      : items.reduce((acc, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const discount = parseFloat(item.discount) || 0;
        const taxWithholding = parseFloat(item.taxWithholding) || 0;

        const bruto = quantity * unitPrice;
        const discountAmount = hasPercentageDiscount ? bruto * (discount / 100) : discount;
        const subtotalItem = bruto - discountAmount;
        return acc + subtotalItem * (taxWithholding / 100);
      }, 0); const totalNeto = subtotal + iva - retencion;
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
      totalImpuestos: totalImpuestos
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
      quantity: 1.00,
      unitPrice: 0.00,
      purchaseValue: 0.00,
      discount: 0.00,
      taxCharge: 0.00,
      taxWithholding: 0.00,
      total: 0.00,
      categoria: "",
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
        let updatedItem;
        if (field === 'unitPrice') {
          // Limpiamos el valor de caracteres no numéricos
          const cleanValue = value.replace(/[^0-9]/g, '');
          const numericValue = cleanValue ? parseFloat(cleanValue) : 0;
          updatedItem = { ...item, [field]: numericValue };
        } else {
          updatedItem = { ...item, [field]: value };
        }
        updatedItem.total = calculateItemTotal(updatedItem);
        return updatedItem;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const handleRetentionChange = (type, value) => {
    setTotals(prev => ({
      ...prev,
      [`${type}Percentage`]: value
    }));
  };
  const columns = [


    ...(hiddenDetails
      ? [
        {
          title: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Categoría</span>
            </div>
          ),
          dataIndex: 'categoria',
          width: columnWidths.categoria,
          render: (text, record) => {
            const usedCategories = items
              .filter(item => item.key !== record.key)
              .map(item => item.categoria); // Comparar con el nombre, no el id
            const availableCategorias = categorias.filter(cat =>
              !usedCategories.includes(cat.name) // Filtrar por nombre
            );

            return (
              <Select
                value={record.categoria}
                onChange={(value) => handleValueChange(record.key, 'categoria', value)}
                className="w-full"
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
                        console.log("Redirigiendo a crear categoría...");
                      }}
                    >
                      Crear categoría
                    </div>
                  </div>
                )}
              >
                {availableCategorias.map((cat) => (
                  <Select.Option key={cat.id} value={cat.name}> {/* Enviar el name como valor */}
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            );
          },
        }
      ]
      : []),
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Producto</span>

        </div>
      ),
      dataIndex: 'product',
      width: columnWidths.product,
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
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Cant</span>

        </div>
      ),
      dataIndex: 'quantity',
      width: columnWidths.quantity,
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
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Valor Unitario</span>

        </div>
      ),
      dataIndex: 'unitPrice',
      width: columnWidths.unitPrice,
      render: (text, record) => (
        <Input
          type="text" // Cambiamos de "number" a "text" para permitir el formato
          value={formatCurrency(text)} // Mostramos el valor formateado
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'unitPrice', e.target.value)}
          placeholder="$0"
        />
      )
    },
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Descuento</span>

        </div>
      ),
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
      )
    },
    ...(!hiddenImpuestos
      ? [
        {
          title: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Impuesto Cargo</span>

            </div>
          ),
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
          )
        },
        {
          title: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Impuesto Retención</span>

            </div>
          ),
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
          )
        }
      ]
      : []),
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Valor Total</span>

        </div>
      ),
      dataIndex: 'total',
      width: columnWidths.total,
      render: (text) => formatCurrency(text)
    },
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span></span>

        </div>
      ),
      key: 'action',
      width: columnWidths.action,
      render: (_, record) => (
        <DeleteOutlined
          type="text"
          danger
          style={{ width: '100%' }}
          onClick={() => handleDeleteRow(record.key)}
        >
          Eliminar
        </DeleteOutlined>
      )
    }
  ];

  const renderSummary = () => {
    return (
      <div style={{ marginTop: '16px', width: '100%', maxWidth: '400px', marginLeft: 'auto' }}>
        <div style={{ border: '1px solid #f0f0f0', padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Total Bruto:</div>
            <div style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(totals.totalBruto)}</div>
            <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Subtotal:</div>
            <div style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(totals.subtotal)}</div>
            <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Descuentos:</div>
            <div style={{ textAlign: 'right', color: '#ff4d4f' }}>-{formatCurrency(totals.descuentos)}</div>
            <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Total en Impuestos:</div>
            <div style={{ textAlign: 'right', fontWeight: 500, color: totals.totalImpuestos >= 0 ? '#52c41a' : '#ff4d4f' }}>
              {totals.totalImpuestos >= 0 ? '+' : ''}{formatCurrency(totals.totalImpuestos)}
            </div>
            {/* Mostrar estos dos campos solo si hiddenImpuestos es false */}
            {!hiddenImpuestos && (
              <>
                <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Retefuente:</div>
                <div style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(totals.retencion)}</div>
                <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Iva:</div>
                <div style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(totals.iva)}</div>
              </>
            )}

            {/* Mostrar los select de IVA y Retención si hiddenImpuestos es true */}
            {hiddenImpuestos && (
              <>
                <div style={{ textAlign: 'right', fontWeight: 500, color: '#666', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
                <div style={{ textAlign: 'right', color: '#ff4d4f' }}>{formatCurrency(totals.iva)}</div>

                <div style={{ textAlign: 'right', fontWeight: 500, color: '#666', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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
                <div style={{ textAlign: 'right', color: '#ff4d4f' }}>-{formatCurrency(totals.retencion)}</div>
              </>
            )}
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '8px' }}>
            <div className="bg-[#0052CC] text-white rounded-md py-2 px-4 flex justify-between items-center">
              <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>Total:</div>
              <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>{formatCurrency(totals.totalNeto)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>

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