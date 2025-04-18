import React, { useState, useEffect } from "react";
import { Input, DatePicker, Divider, Typography, Select, Checkbox } from "antd";
import AccountSelector from "../AccountSelector";
import ImportePersonalizado from "../../../../Terceros/Cajeros/ImportePersonalizado";

const { Title } = Typography;

const ArqueoInputs = ({
  isArqueoChecked,
  arqueoNumber,
  setArqueoNumber,
  date,
  cashierid: parentCashierId,
  setCashierid,
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
  CommissionPorcentaje: parentCommissionPorcentaje,
  setCommissionPorcentaje,
  cashierCommission,
  setCashierCommission,
  comentarios,
  setComentarios,
  formatCurrency,
}) => {
  if (!isArqueoChecked) return null;

  const [showFixedAmounts, setShowFixedAmounts] = useState(false);
  const [cashiers, setCashiers] = useState([]);
  const [localCashierId, setLocalCashierId] = useState(parentCashierId || null);
  const [localCommissionPorcentaje, setLocalCommissionPorcentaje] = useState(parentCommissionPorcentaje || 0);
  const [loading, setLoading] = useState(false);

  const amount = calculateTotalAmount();
  const cashReceivedValue = parseFloat(cashReceived) || 0;

  // Obtener cajeros desde el API
  const ObtenerCajeros = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_FINANZAS}/cajeros`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      const cashiersArray = responseData.data || [];
      const mappedCashiers = cashiersArray.map((cashier) => ({
        id_cajero: cashier.id_cajero,
        nombre: cashier.nombre,
        comision_porcentaje: cashier.comision_porcentaje,
      }));
      setCashiers(mappedCashiers);
    } catch (error) {
      console.error("Error al obtener los cajeros:", error);
      setCashiers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ObtenerCajeros();
  }, []);

  // Manejar cambio de cajero
  const CambiarCajero = (value) => {
    console.log("CambiarCajero ejecutado con valor:", value);
    setLocalCashierId(value);
    setCashierid(value);
    const selectedCashier = cashiers.find((c) => c.id_cajero === value);
    if (selectedCashier) {
      const commissionPercentage = parseFloat(selectedCashier.comision_porcentaje) || 0;
      console.log("Cajero seleccionado:", selectedCashier.nombre, "Comisión:", commissionPercentage);
      setLocalCommissionPorcentaje(commissionPercentage);
      setCommissionPorcentaje(commissionPercentage);
    } else {
      console.warn("No se encontró cajero para el ID:", value);
      setLocalCommissionPorcentaje(0);
      setCommissionPorcentaje(0);
    }
  };

  // Calcular la comisión en tiempo real
  const calculatedCommission = amount * (parseFloat(localCommissionPorcentaje) / 100 || 0);

  // Actualizar el estado del padre cuando la comisión cambie
  useEffect(() => {
    setCashierCommission(calculatedCommission.toFixed(2));
  }, [amount, localCommissionPorcentaje, setCashierCommission]);

  // Función auxiliar para formatear el valor solo para visualización
  const formatInputValue = (value) => {
    return value || value === 0 ? formatCurrency(value) : "";
  };

  const renderContent = () => (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Columna Izquierda - Información de Cajero y Cuenta */}
      <div className="w-full  w-[55em]">
        <div className="bg-white p-6  rounded-lg shadow-sm  space-y-6 mb-2">
          {/* Sección Cajero */}
          <div className="space-y-2">
            <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">
              Cajero
            </label>
            <Select
              value={localCashierId}
              onChange={CambiarCajero}
              className="w-full"
              placeholder="Selecciona un cajero"
              loading={loading}
              size="large"
            >
              {cashiers.map((cashier) => (
                <Select.Option key={cashier.id_cajero} value={cashier.id_cajero}>
                  {cashier.nombre}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Sección Período de Arqueo */}
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

          {/* Sección Cuenta */}
          <div className="space-y-2 ">
            <label className="text-gray-700 font-semibold text-sm  tracking-wide">
             ¿Donde ingreso el dinero?
            </label>
            <AccountSelector
              selectedAccount={account}
              onAccountSelect={(value) => setAccount(value)}
              accounts={accounts}
              className="w-full"
            />
          </div>
        </div>


        <div className="space-y-2 ">
          <Title level={4}>Observaciones</Title>
          <textarea
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            placeholder="Añade comentarios adicionales"
            rows={5}
            className="w-full border p-2"
          />
        </div>
      </div>




      {/* Columna Derecha - Detalles de la Factura */}
      <div className="w-full md:w-1/2">
        {renderInvoiceDetails()}
      </div>
    </div>
  );


  const renderInvoiceHeader = () => (
    <div className="border-b-2 border-gray-200 pb-4 mb-6">
      {/* Encabezado superior */}
      <div className="flex  p-2 rounded-md justify-between items-center mb-2 mt-[-2em]">
        <div className="flex items-center space-x-3 w-full md:w-2/3">
          <span className="text-gray-600 font-semibold whitespace-nowrap">Título:</span>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Añade un título descriptivo"
            className="w-full border p-2 rounded-md"
          />
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 p-2 rounded-md   ">
            <span className="text-gray-700 font-semibold">No.</span>
            <Input
              value={arqueoNumber}
              onChange={(e) => setArqueoNumber(e.target.value)}
              placeholder="Número de Arqueo"
              className="w-30 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className=" px-6">


        {renderContent()}

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
              <div className="flex justify-between">
                <div>Efectivo esperado:</div>
                <div>{formatCurrency(totalAmount)}</div>
              </div>
              <div className="flex justify-between">
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

  // Renderizado del apartado de factura
  const renderInvoiceDetails = () => (
    <div className="space-y-6">
      <div className="border rounded-lg overflow-hidden">
        {/* Tabla Principal */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left font-semibold border-b">Referencia</th>
              <th className="p-3 text-right font-semibold border-b">¿Cuanto?</th>
            </tr>
          </thead>
          <tbody>
            {/* Ingresos Variables */}
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b">Importe FEV</td>
              <td className="p-3 border-b text-right">
                <Input
                  value={formatInputValue(fevAmount)}
                  onChange={(e) => handleAmountChange(e, "fev")}
                  placeholder="$0"
                  className="w-40 text-right"
                />
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b">Importe Diverso</td>
              <td className="p-3 border-b text-right">
                <Input
                  value={formatInputValue(diversoAmount)}
                  onChange={(e) => handleAmountChange(e, "diverso")}
                  placeholder="$0"
                  className="w-40 text-right"
                />
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b">Otros Ingresos</td>
              <td className="p-3 border-b text-right">
                <Input
                  value={formatInputValue(otherIncome)}
                  onChange={(e) => handleAmountChange(e, "other_incomes")}
                  placeholder="$0"
                  className="w-40 text-right"
                />
              </td>
            </tr>

          {/* Importes Fijos */}
          {showFixedAmounts && (
              <tr className="hover:bg-gray-50">
                <td className="p-3 border-b">Importes Fijos</td>
                <td className="p-3 border-b text-right">
                  {formatCurrency(customAmountsTotal)}
                </td>
              </tr>
            )}


          </tbody>

        </table>

        <div>
          <div className="">


            <div className="p-3  border-t flex justify-between items-center ">
              <span>Mostrar Detalle de Importes Fijos</span>
              <button
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowFixedAmounts(!showFixedAmounts)}
              >
                <span>{showFixedAmounts}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transition-transform transform ${showFixedAmounts ? "rotate-180" : ""
                    }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>


          

            {showFixedAmounts && (
              <div className="w-full px-21 bg-gray-50 ">
                <Title level={5} className="mb-3">Detalles de Importes Fijos</Title>
                <ImportePersonalizado
                  items={customAmounts}
                  onItemsChange={handleCustomAmountsChange}
                  onTotalsChange={handleCustomTotalsChange}
                />
              </div>
            )}


          </div>



        </div>


        <table className="w-full border-collapse">

          <tbody>

            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b">Total a Cobrar</td>
              <td className="p-3 border-b text-right">
                {formatCurrency(amount)}
              </td>
            </tr>

            {/* Comisión */}
            <tr className="hover:bg-gray-50">
              <td className="p-3 border-b">Comisión ({localCommissionPorcentaje}%)</td>
              <td className="p-3 border-b text-right">
                {formatCurrency(calculatedCommission)}
              </td>
            </tr>

            {/* Efectivo Recibido */}
            <tr className="bg-blue-600 font-bold">
              <td className="p-6 border-t text-xl text-white text-left">¿Cuanto recibi en efectivo?</td>
              <td className="p-6 border-t text-xl text-white text-left">
                <Input
                  value={formatInputValue(cashReceived)}
                  onChange={(e) => handleAmountChange(e, "cashReceived")}
                  placeholder="$0"
                  className="w-40 text-right"
                />
              </td>
            </tr>
          </tbody>
        </table>






      </div>

      {renderDiscrepancyMessage()}
    </div >
  );

  return (
    <div className=" space-y-8">
      {renderInvoiceHeader()}



    </div>
  );
};

export default ArqueoInputs;