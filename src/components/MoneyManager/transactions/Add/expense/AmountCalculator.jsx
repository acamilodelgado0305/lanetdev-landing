// AmountCalculator.jsx
import React, { useState, useEffect } from 'react';
import { Input, Select } from "antd";

const { Option } = Select;

const AmountCalculator = ({ 
  baseAmount, 
  onBaseAmountChange,
  rawAmount,
  setRawAmount,
  setFinalAmount 
}) => {
  const [ivaType, setIvaType] = useState("19");
  const [hasRetefuente, setHasRetefuente] = useState(false);
  const RETEFUENTE_THRESHOLD = 1300000;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO").format(value);
  };

  const handleBaseAmountChange = (e) => {
    const value = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
    const numericValue = parseFloat(value) || 0;
    setRawAmount(numericValue);
    onBaseAmountChange(formatCurrency(numericValue));
    calculateTotal(numericValue, ivaType);
  };

  const calculateTotal = (base, ivaPercentage) => {
    const baseNumber = parseFloat(base) || 0;
    const ivaAmount = baseNumber * (parseFloat(ivaPercentage) / 100);
    let retefuenteAmount = 0;

    if (hasRetefuente && baseNumber >= RETEFUENTE_THRESHOLD) {
      retefuenteAmount = baseNumber * 0.025; // 2.5% de retención
    }

    const total = baseNumber + ivaAmount - retefuenteAmount;
    setFinalAmount(total);
  };

  useEffect(() => {
    calculateTotal(rawAmount, ivaType);
  }, [ivaType, hasRetefuente, rawAmount]);

  useEffect(() => {
    setHasRetefuente(rawAmount >= RETEFUENTE_THRESHOLD);
  }, [rawAmount]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Importe Base
        </label>
        <Input
          value={baseAmount}
          onChange={handleBaseAmountChange}
          prefix="$"
          size="large"
          className="text-lg"
          placeholder="Ingrese el importe base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          IVA
        </label>
        <Select
          value={ivaType}
          onChange={(value) => {
            setIvaType(value);
            calculateTotal(rawAmount, value);
          }}
          className="w-full"
        >
          <Option value="19">IVA 19%</Option>
          <Option value="5">IVA 5%</Option>
          <Option value="0">IVA 0%</Option>
        </Select>
      </div>

      {rawAmount >= RETEFUENTE_THRESHOLD && (
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">
            Se aplica retención en la fuente del 2.5% por superar $1,300,000
          </p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span>Base:</span>
          <span>${formatCurrency(rawAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>IVA ({ivaType}%):</span>
          <span>${formatCurrency(rawAmount * (parseFloat(ivaType) / 100))}</span>
        </div>
        {hasRetefuente && rawAmount >= RETEFUENTE_THRESHOLD && (
          <div className="flex justify-between text-red-600">
            <span>Retefuente (2.5%):</span>
            <span>-${formatCurrency(rawAmount * 0.025)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold border-t pt-2">
          <span>Total:</span>
          <span>${formatCurrency(rawAmount + 
            (rawAmount * (parseFloat(ivaType) / 100)) - 
            (hasRetefuente && rawAmount >= RETEFUENTE_THRESHOLD ? rawAmount * 0.025 : 0)
          )}</span>
        </div>
      </div>
    </div>
  );
};

export default AmountCalculator;