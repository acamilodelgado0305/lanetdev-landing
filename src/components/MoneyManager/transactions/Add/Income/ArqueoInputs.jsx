import React from "react";
import { Input, DatePicker, Divider, Typography, Select } from "antd";
import AccountSelector from "../AccountSelector";
import ImportePersonalizado from "../../../../Terceros/Cajeros/ImportePersonalizado";

const { Title } = Typography;

const ArqueoInputs = ({
  isArqueoChecked,
  arqueoNumber,
  setArqueoNumber,
  date,
  cashierid,
  setCashierid,
  cashiers,
  description,
  setDescription,
  startPeriod,
  setStartPeriod,
  endPeriod,
  setEndPeriod,
  account,
  setAccount,
  accounts,
  fevAmount,
  handleAmountChange,
  diversoAmount,
  otherIncome,
  customAmounts,
  handleCustomAmountsChange,
  handleCustomTotalsChange,
  customAmountsTotal,
  cashReceived,
  calculateTotalAmount,
  CommissionPorcentaje,
  cashierCommission,
  comentarios,
  setComentarios,
  formatCurrency,
}) => {
  if (!isArqueoChecked) return null;

  const amount = calculateTotalAmount();
  const cashReceivedValue = parseFloat(cashReceived) || 0;
  const commission = amount * (CommissionPorcentaje / 100);

  const renderInvoiceHeader = () => (
    <div className="border-b-2 border-gray-200 pb-4 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">COMPROBANTE DE ARQUEO</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">No.</span>
            <Input
              value={arqueoNumber}
              onChange={(e) => setArqueoNumber(e.target.value)}
              placeholder="Número de Arqueo"
              className="w-40"
            />
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center justify-end space-x-4">
            <p className="text-gray-600">Fecha: {date?.format("DD/MM/YYYY")}</p>
          </div>
          <div className="flex items-center justify-end space-x-4">
            <span className="text-gray-600">Cajero:</span>
            <Select
              value={cashierid}
              onChange={setCashierid}
              className="w-64"
              placeholder="Selecciona un cajero"
            >
              {cashiers.map((cashier) => (
                <Select.Option key={cashier.id_cajero} value={cashier.id_cajero}>
                  {cashier.nombre}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">Título:</span>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Añade un título descriptivo"
          rows={1}
          className="w-[50em] border p-1"
        />
      </div>
    </div>
  );

  const renderDiscrepancyMessage = () => {
    const totalAmount = calculateTotalAmount();
    const difference = cashReceivedValue - totalAmount;
    const isCashMatch = Math.abs(difference) < 0.01;

    let messageText, messageClass, differenceText, questionText;

    if (isCashMatch) {
      messageText = "Los valores coinciden correctamente";
      messageClass = "bg-green-100 text-green-700";
      differenceText = "";
    } else if (difference > 0) {
      messageText = "¡Alerta! Hay un excedente en el arqueo";
      messageClass = "bg-yellow-100 text-yellow-700";
      differenceText = `Sobran ${formatCurrency(difference)}`;
      questionText = "¿Por qué hay dinero extra? Verifique posibles errores en el registro de ventas.";
    } else {
      messageText = "¡Error! Hay un déficit en el arqueo";
      messageClass = "bg-red-100 text-red-700";
      differenceText = `Faltan ${formatCurrency(Math.abs(difference))}`;
      questionText = "¿Por qué falta dinero? Revise posibles errores de cobro o si hubo retiros no registrados.";
    }

    return (
      <div className={`p-4 rounded-lg mb-4 ${messageClass}`}>
        <h3 className="font-bold text-lg mb-2">{messageText}</h3>
        {!isCashMatch && (
          <div className="flex flex-col space-y-2">
            <div className="text-2xl font-bold mb-3">Diferencia: {differenceText}</div>
            <div className="space-y-2 text-sm">
              <div className="justify-between">
                <div>Efectivo esperado:</div>
                <div>{formatCurrency(totalAmount)}</div>
              </div>
              <div className="justify-between">
                <div>Efectivo recibido:</div>
                <div>{formatCurrency(cashReceivedValue)}</div>
              </div>
            </div>
            <div className="mt-3 border-t pt-3 italic">{questionText}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {renderInvoiceHeader()}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <Title level={4}>Período de Arqueo</Title>
          <div className="flex space-x-4">
            <DatePicker
              value={startPeriod}
              onChange={(date) => setStartPeriod(date)}
              placeholder="Fecha Inicio"
              className="w-40"
            />
            <DatePicker
              value={endPeriod}
              onChange={(date) => setEndPeriod(date)}
              placeholder="Fecha Fin"
              className="w-40"
            />
          </div>
        </div>
      </div>
      <Divider />
      <div className="space-y-4">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Title level={4} style={{ margin: 0 }}>Donde ingresa el dinero*</Title>
        </div>
        <AccountSelector
          selectedAccount={account}
          onAccountSelect={(value) => setAccount(value)}
          accounts={accounts}
        />
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4">
            <Title level={5}>Desglose de Ingresos</Title>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Importe FEV:</span>
                <Input
                  value={formatCurrency(fevAmount)}
                  onChange={(e) => handleAmountChange(e, "fev")}
                  className="w-40"
                />
              </div>
              <div className="flex justify-between">
                <span>Importe Diverso:</span>
                <Input
                  value={formatCurrency(diversoAmount)}
                  onChange={(e) => handleAmountChange(e, "diverso")}
                  className="w-40"
                />
              </div>
              <div className="flex justify-between">
                <span>Otros Ingresos:</span>
                <Input
                  value={formatCurrency(otherIncome)}
                  onChange={(e) => handleAmountChange(e, "other_incomes")}
                  className="w-40"
                />
              </div>
              <div className="mt-4">
                <Title level={5}>Importes Fijos</Title>
                <ImportePersonalizado
                  items={customAmounts}
                  onItemsChange={handleCustomAmountsChange}
                  onTotalsChange={handleCustomTotalsChange}
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4">
            <Title level={5}>Resumen</Title>
            <div className="space-y-3">
              <div className="bg-[#0052CC] text-white rounded-md py-2 px-4 flex justify-between items-center">
                <span className="text-white text-xl">Total a cobrar</span>
                <span className="font-bold text-lg">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Efectivo Recibido:</span>
                <Input
                  value={formatCurrency(cashReceived)}
                  onChange={(e) => handleAmountChange(e, "cashReceived")}
                  className="w-40"
                />
              </div>
              <div className="flex justify-between">
                <span>Comisión ({CommissionPorcentaje}%):</span>
                <span className="font-bold">{formatCurrency(cashierCommission)}</span>
              </div>
            </div>
          </div>
        </div>
        {renderDiscrepancyMessage()}
      </div>
      <Divider />
      <div className="space-y-4">
        <Title level={4}>Observaciones</Title>
        <textarea
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          placeholder="Añade comentarios adicionales"
          rows={3}
          className="w-full border p-2"
        />
      </div>
    </div>
  );
};

export default ArqueoInputs;