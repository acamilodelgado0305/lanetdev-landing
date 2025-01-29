import React, { useState, useEffect } from "react";
import { Input, InputNumber, Switch } from "antd";

const AmountCalculator = ({
  baseAmount,
  onBaseAmountChange,
  rawAmount,
  setRawAmount,
  setFinalAmount,
  hasIva,
  setHasIva,
  hasRetefuente,
  setHasRetefuente,
  retefuentePercentage,
  setRetefuentePercentage,
  setIvaAmount,
  setRetefuenteAmount,
}) => {
  const IVA_PERCENTAGE = 19;
  const RETEFUENTE_THRESHOLD = 1271000;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO").format(value);

  const handleBaseAmountChange = (e) => {
    const value = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
    const numericValue = parseFloat(value) || 0;
    setRawAmount(numericValue);
    onBaseAmountChange(formatCurrency(numericValue));
    calculateTotal(numericValue);
  };

  const calculateTotal = (base) => {
    const baseNumber = parseFloat(base) || 0;
    const ivaAmount = hasIva ? baseNumber * (IVA_PERCENTAGE / 100) : 0;
    let retefuenteAmount = 0;

    if (hasRetefuente && baseNumber >= RETEFUENTE_THRESHOLD) {
      retefuenteAmount = baseNumber * (retefuentePercentage / 100);
    }

    setIvaAmount(ivaAmount);
    setRetefuenteAmount(retefuenteAmount);
    const total = baseNumber + ivaAmount - retefuenteAmount;
    setFinalAmount(total);
  };

  useEffect(() => {
    calculateTotal(rawAmount);
  }, [hasIva, retefuentePercentage, hasRetefuente, rawAmount]);

  useEffect(() => {
    if (rawAmount < RETEFUENTE_THRESHOLD) {
      setHasRetefuente(false);
    }
  }, [rawAmount]);

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-gray-700">Importe Base</label>
        <Input
          value={baseAmount}
          onChange={handleBaseAmountChange}
          prefix="$"
          size="small"
          placeholder="Ingrese el importe base"
        />
      </div>

      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">IVA (19%)</label>
        <Switch
          checked={hasIva}
          onChange={(checked) => setHasIva(checked)}
          className={hasIva ? "bg-red-500" : "bg-gray-400"}
        />
      </div>

      {hasIva && (
        <div>
          <Input
            value={`$${formatCurrency(rawAmount * (IVA_PERCENTAGE / 100))}`}
            disabled
            size="small"
            className="bg-gray-50"
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">
          Retefuente
        </label>
        <Switch
          checked={hasRetefuente}
          onChange={(checked) => {
            if (rawAmount >= RETEFUENTE_THRESHOLD || !checked) {
              setHasRetefuente(checked);
            }
          }}
          disabled={rawAmount < RETEFUENTE_THRESHOLD}
          className={hasRetefuente ? "bg-red-500" : "bg-gray-400"}
        />
      </div>

      {hasRetefuente && (
        <div>
          <label className="text-sm font-medium text-gray-700">
            % Retefuente
          </label>
          <InputNumber
            value={retefuentePercentage}
            onChange={(value) => setRetefuentePercentage(value || 0)}
            min={0}
            max={100}
            step={0.1}
            formatter={(value) => `${value}%`}
            parser={(value) => value.replace("%", "")}
            size="small"
            className="w-full"
          />
        </div>
      )}

      <div className="bg-gray-50 p-2 rounded-md text-sm space-y-1">
        <div className="flex justify-between">
          <span>Base:</span>
          <span>${formatCurrency(rawAmount)}</span>
        </div>
        {hasIva && (
          <div className="flex justify-between">
            <span>IVA:</span>
            <span>${formatCurrency(rawAmount * (IVA_PERCENTAGE / 100))}</span>
          </div>
        )}
        {hasRetefuente && (
          <div className="flex justify-between text-red-600">
            <span>Retefuente:</span>
            <span>-${formatCurrency(rawAmount * (retefuentePercentage / 100))}</span>
          </div>
        )}
        <div className="flex justify-between font-bold border-t pt-1">
          <span>Total:</span>
          <span>${formatCurrency(rawAmount + 
            (hasIva ? rawAmount * (IVA_PERCENTAGE / 100) : 0) - 
            (hasRetefuente ? rawAmount * (retefuentePercentage / 100) : 0)
          )}</span>
        </div>
      </div>
    </div>
  );
};

export default AmountCalculator;
