import React, { useState, useEffect } from "react";
import { format as formatDate } from "date-fns";
import { es } from "date-fns/locale";
import axios from "axios";
import { Button, Card, Tooltip } from "antd";
import { CloseOutlined, EditOutlined, ShareAltOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { getAccounts } from "../../../../../services/moneymanager/moneyService";

function ViewExpense({ entry, visible, onClose }) {
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (visible && entry?.id) {
      fetchExpenseData(entry.id);
    }
  }, [visible, entry]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchExpenseData = async (id) => {
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || "/api";
      const response = await axios.get(`${API_BASE_URL}/expenses/${id}`);
      setExpenseData(response.data);
    } catch (error) {
      console.error("Error fetching expense data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Error al obtener las cuentas:", error);
    }
  };

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "No asignada";
  };

  const handleEditSelected = () => {
    navigate(`/index/moneymanager/egresos/edit/${entry.id}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderDate = (date) => {
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return "Fecha inválida";
      }
      return formatDate(parsedDate, "d MMM yyyy", { locale: es });
    } catch (error) {
      console.error("Error al formatear la fecha:", error);
      return "Fecha inválida";
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-5xl max-h-[90vh] overflow-auto bg-white shadow-2xl rounded-lg"
        bodyStyle={{ padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm">
              {expenseData ? (
                <>EGRESO - {expenseData.invoice_number || "SN"}</>
              ) : (
                <p>Cargando detalles del egreso...</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Tooltip title="Compartir">
              <Button
                icon={<ShareAltOutlined />}
                className="border border-gray-300 text-gray-600 hover:text-blue-700 hover:border-blue-700"
                type="text"
                disabled
              />
            </Tooltip>
            <Tooltip title="Editar">
              <Button
                onClick={handleEditSelected}
                icon={<EditOutlined />}
                className="border border-gray-300 text-gray-600 hover:text-blue-700 hover:border-blue-700"
                type="text"
              />
            </Tooltip>
            <Tooltip title="Cerrar">
              <Button
                onClick={onClose}
                icon={<CloseOutlined />}
                className="border border-gray-300 text-gray-600 hover:text-blue-700 hover:border-blue-700"
                type="text"
              />
            </Tooltip>
          </div>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-700"></div>
          </div>
        ) : expenseData ? (
          <div className="p-6">
            {/* General Information */}
            <Card
              title={<h3 className="text-lg font-semibold text-gray-800">Información General</h3>}
              className="mb-6 shadow-sm"
              bordered={false}
            >
              <div className="p-4 bg-gray-50 rounded-md space-y-2 text-sm">
                <dl className="grid grid-cols-1 gap-y-1">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Fecha:</dt>
                    <dd className="font-medium">{renderDate(expenseData.date)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Número de Factura:</dt>
                    <dd className="font-medium">{expenseData.invoice_number || "No disponible"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Cuenta:</dt>
                    <dd>{getAccountName(expenseData.account_id)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Tipo:</dt>
                    <dd className="font-medium">{expenseData.type || "No especificado"}</dd>
                  </div>
                </dl>
              </div>
            </Card>
            {/* Comments */}


            {/* Financial Breakdown */}
            <Card
              title={
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-700 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="font-semibold text-gray-800">Desglose Financiero</h3>
                </div>
              }
              className="shadow-md"
              bordered={false}
            >
              {/* Item Details Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-2 px-4 text-left text-gray-600">Producto</th>
                      <th className="py-2 px-4 text-center text-gray-600">Cantidad</th>
                      <th className="py-2 px-4 text-center text-gray-600">Precio Unitario</th>
                      <th className="py-2 px-4 text-center text-gray-600">Impuesto (%)</th>
                      <th className="py-2 px-4 text-center text-gray-600">Retención (%)</th>
                      <th className="py-2 px-4 text-right text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseData.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{item.quantity}</td>
                        <td className="py-3 px-4 text-center font-mono">{formatCurrency(item.unit_price)}</td>
                        <td className="py-3 px-4 text-center font-mono">
                          <Tooltip title="Porcentaje de impuesto cargado (ej. IVA)">
                            {item.tax_charge || 0}%
                          </Tooltip>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <Tooltip title="Porcentaje de retención aplicada">
                            {item.tax_withholding || 0}%
                          </Tooltip>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary */}
              <div className="mt-6 p-6 bg-gradient-to-b from-gray-50 to-white border border-gray-300 rounded-lg shadow-lg">
                {/* Encabezado del resumen */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Resumen Financiero
                  </h4>
                </div>

                {/* Detalles financieros */}
                <div className="text-sm">
                  {/* Total Bruto */}
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Total Bruto</span>
                    <span className="font-mono font-medium text-gray-800">
                      {formatCurrency(expenseData.total_gross)}
                    </span>
                  </div>

                  {/* Descuentos */}
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Descuentos</span>
                    <span className="font-mono font-medium text-red-600">
                      -{formatCurrency(expenseData.discounts)}
                    </span>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-semibold">Subtotal</span>
                    <span className="font-mono font-semibold text-gray-800">
                      {formatCurrency(expenseData.subtotal)}
                    </span>
                  </div>

                  {/* IVA */}
                  {expenseData.ret_vat !== "0.00" && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">
                        IVA ({expenseData.ret_vat_percentage}%)
                      </span>
                      <span className="font-mono font-medium text-blue-600">
                        +{formatCurrency(expenseData.ret_vat)}
                      </span>
                    </div>
                  )}

                  {/* Retención */}
                  {expenseData.ret_ica !== "0.00" && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">
                        Retención ({expenseData.ret_ica_percentage}%)
                      </span>
                      <span className="font-mono font-medium text-red-600">
                        -{formatCurrency(expenseData.ret_ica)}
                      </span>
                    </div>
                  )}

                  {/* Total Impuestos */}
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <Tooltip title="Suma neta de impuestos (Impuestos - Retenciones)">
                      <span className="text-gray-600 font-medium">Total Impuestos</span>
                    </Tooltip>
                    <span
                      className={`font-mono font-medium ${expenseData.total_impuestos >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {expenseData.total_impuestos >= 0 ? "+" : ""}
                      {formatCurrency(expenseData.total_impuestos)}
                    </span>
                  </div>

                  {/* Total Neto */}
                  <div className="flex justify-between items-center py-4 mt-4 border-t-2 border-gray-300">
                    <span className="text-xl font-bold text-gray-800">Total Neto</span>
                    <span className="text-xl font-bold text-blue-700 font-mono">
                      {formatCurrency(expenseData.total_net)}
                    </span>
                  </div>
                </div>

                {/* Nota adicional (opcional) */}
                <div className="mt-4 text-xs text-gray-500">
                  <p>
                    * Los valores incluyen todos los impuestos y retenciones aplicados.
                  </p>
                </div>
              </div>


              <Card
                title={<h3 className="text-lg font-semibold text-gray-800">Comentarios</h3>}
                className="mb-6 shadow-md"
                bordered={false}
              >
                <p className="text-gray-700 bg-gray-50 p-4 rounded-md">
                  {expenseData.comments || "Sin comentarios"}
                </p>
              </Card>

              {/* Footer */}
              <div className="py-4 px-4 text-xs text-gray-500 border-t border-gray-200">
                <div className="flex justify-between">
                  <span>Fecha de Registro: {renderDate(expenseData.date)}</span>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-600">No se encontraron detalles para este egreso.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ViewExpense;