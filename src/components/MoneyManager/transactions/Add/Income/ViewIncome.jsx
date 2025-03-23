import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import axios from "axios";
import { Button, Card, Tooltip } from "antd";
import { CloseOutlined, EditOutlined, ShareAltOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAccounts } from "../../../../../services/moneymanager/moneyService";
import { getCajeros } from "../../../../../services/cajeroService";


function ViewIncome({ entry, visible, onClose, activeTab }) {
  const [incomeData, setIncomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [cajeros, setCajeros] = useState([]);

  useEffect(() => {
    if (visible && entry?.id) {
      fetchIncomeData(entry.id);
    }
  }, [visible, entry]);

  useEffect(() => {
    fetchAccounts();
    fetchCajeros();
  }, []);

  const fetchIncomeData = async (id) => {
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || "/api";
      const response = await axios.get(`${API_BASE_URL}/incomes/${id}`);
      setIncomeData(response.data);
    } catch (error) {
      console.error("Error fetching income data:", error);
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

  const fetchCajeros = async () => {
    try {
      const response = await getCajeros();
      let data = Array.isArray(response) ? response : response?.data || [];
      setCajeros(data);
      if (data.length === 0) {
        console.warn("No se encontraron cajeros.");
      }
    } catch (error) {
      console.error("Error al obtener los cajeros:", error);
      setCajeros([]);
    }
  };

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "No asignada";
  };

  const getCajeroName = (cashierId) => {
    const cajero = cajeros.find((cjr) => cjr.id_cajero === cashierId);
    return cajero ? cajero.nombre : "No asignado";
  };

  const handleEditSelected = () => {
    navigate(`/index/moneymanager/ingresos/edit/${entry.id}`, {
      state: { returnTab: activeTab }, // Pasar activeTab como returnTab
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderDate = (date) => {
    if (!date) return "Sin fecha";

    console.log("Fecha original recibida:", date, "Tipo:", typeof date);

    try {
      let parsedDate;

      // Si es un string, intentamos varios métodos de parsing
      if (typeof date === 'string') {
        // Eliminar 'Z' si existe para evitar conversión UTC
        const cleanDate = date.endsWith('Z') ? date.substring(0, date.length - 1) : date;
        console.log("Fecha limpia:", cleanDate);

        // Intentar primero con fromISO (formato ISO)
        parsedDate = DateTime.fromISO(cleanDate, { zone: "America/Bogota" });

        // Si no es válido, intentar con fromSQL (formato de base de datos)
        if (!parsedDate.isValid) {
          console.log("Intento con fromSQL");
          parsedDate = DateTime.fromSQL(cleanDate, { zone: "America/Bogota" });
        }

        // Si sigue sin ser válido, intentar con fromFormat para algunos formatos comunes
        if (!parsedDate.isValid) {
          console.log("Intento con formatos específicos");
          const formats = [
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm:ss",
            "dd/MM/yyyy HH:mm:ss",
            "yyyy-MM-dd"
          ];

          for (const format of formats) {
            parsedDate = DateTime.fromFormat(cleanDate, format, { zone: "America/Bogota" });
            if (parsedDate.isValid) break;
          }
        }
      } else if (date instanceof Date) {
        // Si es un objeto Date, convertirlo directamente
        parsedDate = DateTime.fromJSDate(date, { zone: "America/Bogota" });
      }

      // Verificar si se pudo parsear correctamente
      if (!parsedDate || !parsedDate.isValid) {
        console.warn("No se pudo parsear la fecha:", date);
        return "Fecha inválida";
      }

      console.log("Fecha parseada correctamente:", parsedDate.toISO());
      // Formatear con configuración regional española
      return parsedDate.setLocale('es').toFormat("d 'de' MMMM 'de' yyyy HH:mm");
    } catch (error) {
      console.error("Error al formatear la fecha:", error, "Fecha original:", date);
      return "Fecha inválida";
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-[800px] bg-white shadow-lg rounded-lg overflow-hidden"
        bodyStyle={{ padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="p-6 bg-gray-100 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "SF Pro Display, sans-serif" }}>
                Factura de Ingreso
              </h1>
              <p className="text-sm text-gray-500">
                No. {incomeData?.arqueo_number || "Sin número"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-700" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
                {renderDate(incomeData?.date)}
              </p>
              <p className="text-sm text-gray-500">{getAccountName(incomeData?.account_id)}</p>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Tooltip title="Compartir">
              <Button
                icon={<ShareAltOutlined />}
                className="text-gray-500 hover:text-gray-700 bg-transparent border-none"
                disabled
              />
            </Tooltip>
            <Tooltip title="Editar">
              <Button
                onClick={handleEditSelected}
                icon={<EditOutlined />}
                className="text-gray-500 hover:text-gray-700 bg-transparent border-none"
              />
            </Tooltip>
            <Tooltip title="Cerrar">
              <Button
                onClick={onClose}
                icon={<CloseOutlined />}
                className="text-gray-500 hover:text-gray-700 bg-transparent border-none"
              />
            </Tooltip>
          </div>
        </div>

        {/* Cuerpo */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-gray-400"></div>
          </div>
        ) : incomeData ? (
          <div className="p-6">
            {/* Información general */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
                <div>
                  <span className="font-medium font-semibold text-gray-900">Titulo: </span> {(incomeData.description)}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Cajero:</span> {getCajeroName(incomeData.cashier_id)}
                </div>
                <div>
                  <span className="font-medium text-gray-900">Tipo:</span> {incomeData.type || "No especificado"}
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-900">Período:</span>{" "}
                  {renderDate(incomeData.start_period)} - {renderDate(incomeData.end_period)}
                </div>
              </div>
            </div>

            {/* Tabla de ítems */}
            <div className="mb-6">
              <table className="w-full text-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-3 px-4 text-left font-medium text-gray-700" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
                      Concepto
                    </th>
                    <th className="py-3 px-4 text-right font-medium text-gray-700" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
                      Importe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-900">Importe FEV</td>
                    <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(incomeData.amountfev)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-900">Ingresos Diversos</td>
                    <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(incomeData.amountdiverse)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-900">Otros Ingresos</td>
                    <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(incomeData.other_income)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-900">Efectivo Recibido</td>
                    <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(incomeData.cash_received)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 font-semibold text-gray-900">Total Ingresos</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">{formatCurrency(incomeData.amount)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-900">Comisión del Cajero</td>
                    <td className="py-3 px-4 text-right text-red-500">-{formatCurrency(incomeData.cashier_commission)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Resumen y comentarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2" style={{ fontFamily: "SF Pro Display, sans-serif" }}>
                  Notas
                </h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-200">
                  {incomeData.comentarios || "Sin notas"}
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4" style={{ fontFamily: "SF Pro Display, sans-serif" }}>
                  Resumen
                </h3>
                <div className="space-y-3 text-sm" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Ingresos</span>
                    <span className="text-gray-900">{formatCurrency(incomeData.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Comisión</span>
                    <span className="text-red-500">-{formatCurrency(incomeData.cashier_commission)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-3">
                    <span className="font-semibold text-gray-900">Total Neto</span>
                    <span className="font-semibold text-green-600 text-lg">
                      {formatCurrency(incomeData.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pie de página */}
            <div className="mt-6 p-4 bg-gray-100 border-t border-gray-200 text-xs text-gray-500" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
              <div className="flex justify-between">
                <span>Registrado el: {renderDate(incomeData.date)}</span>
                <span>{incomeData.type || "No especificado"}</span>
              </div>
              <p className="mt-2 text-center">Factura generada automáticamente</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto text-gray-400 mb-4"
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
            <p className="text-gray-500" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
              No se encontraron detalles para este ingreso.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ViewIncome;