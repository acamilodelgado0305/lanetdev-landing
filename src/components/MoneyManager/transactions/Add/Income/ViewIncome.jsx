import React, { useState, useEffect } from "react";
import { format as formatDate } from "date-fns";
import { es } from "date-fns/locale";
import axios from "axios";
import { Button } from 'antd';
import { CloseOutlined, EditOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

import {
  getAccounts,
} from "../../../../../services/moneymanager/moneyService";
import {
  getCajeros,
} from "../../../../../services/cajeroService";

function ViewIncome({ entry, visible, onClose }) {
  const [incomeData, setIncomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]); // Estado para almacenar las cuentas
  const [cajeros, setCajeros] = useState([]);   // Estado para almacenar los cajeros


  // Fetch income data when the modal is opened
  useEffect(() => {
    if (visible && entry?.id) {
      fetchIncomeData(entry.id);
    }


  }, [visible, entry]);
  useEffect(() => {
    fetchAccounts();
    fetchCajeros(); // Add this to fetch cashiers data
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

      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && Array.isArray(response.data)) {
        data = response.data;
      } else {
        console.warn("La respuesta no contiene datos válidos:", response);
      }

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
    // Buscar el cajero por su "id_cajero"
    const cajero = cajeros.find((cjr) => cjr.id_cajero === cashierId);

    // Retornar el nombre si se encuentra el cajero, de lo contrario retornar "No asignado"
    return cajero ? cajero.nombre : "No asignado";
  };


  const handleEditSelected = () => {
    navigate(`/index/moneymanager/ingresos/edit/${entry.id}`);
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
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-white w-11/12 max-w-6xl max-h-[80vh] overflow-auto shadow-lg z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-700 text-white px-3 py-1 font-semibold text-sm">
                {incomeData ? (
                  <>
                    {incomeData.type.toUpperCase()} - {incomeData?.arqueo_number || "XX"}
                    
                  </>
                ) : (
                  <p>Cargando detalles del ingreso...</p>
                )}
              </div>
              
            </div>

            <div className="border border-gray-200 flex items-center p-3">
            </div>

            <div>

              <Button
                onClick={onClose}
                disabled
                icon={<ShareAltOutlined />}
                className="border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 mr-2"
                type="text" // Esto hace que el botón sea sin fondo
              />

              <Button
                onClick={handleEditSelected}
                icon={<EditOutlined />}
                className="border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 mr-2"
                type="text" // Esto hace que el botón sea sin fondo
              />

              <Button
                onClick={onClose}
                icon={<CloseOutlined />}
                className="border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400"
                type="text" // Esto hace que el botón sea sin fondo
              />

            </div>

          </div>

          {/* Modal Body */}
          {loading ? (
            <div className="flex justify-center items-center p-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : incomeData ? (
            <div>
              {/* Key Information Header */}


              {/* Main Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column - General Information */}
                  <div className="md:col-span-2">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Información General</h3>
                      <div className="border border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2">
                          <div className="border-b sm:border-r border-gray-200 p-4">
                            <div className="text-sm text-gray-500">Fecha</div>
                            <div className="font-medium mt-1">{renderDate(incomeData.date)}</div>
                          </div>
                          <div className="border-b border-gray-200 p-4">
                            <div className="text-sm text-gray-500">Número de Arqueo</div>
                            <div className="font-medium mt-1">{incomeData.arqueo_number || "No disponible"}</div>
                          </div>
                          <div className="border-b sm:border-r border-gray-200 p-4">
                            <div className="text-sm text-gray-500">Cuenta</div>
                            <p> {getAccountName(incomeData.account_id)}</p>
                          </div>
                          <div className="border-b border-gray-200 p-4">
                            <div className="text-sm text-gray-500">Cajero</div>
                            <p> {getCajeroName(incomeData.cashier_id)}</p>
                          </div>
                          <div className="border-b border-gray-200 p-4 w-[5">
                            <div className="text-sm text-gray-500">Tipo</div>
                            <div className="font-medium mt-1">{incomeData.type || "No especificado"}</div>
                          </div>
                          <div className="border-b border-gray-200 p-4">
                            <div className="text-xl font-bold text-blue-700">
                              Período: {renderDate(incomeData.start_period)} - {renderDate(incomeData.end_period)}
                            </div>
                          </div>



                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-4">Comentarios</h3>
                      <div className="bg-gray-50 border border-gray-200 p-4 min-h-16">
                        {incomeData.comentarios || "Sin comentarios"}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Financial Details */}
                  <div className="bg-white shadow-sm">
                    <div className="bg-gray-50 p-4 border border-gray-200 border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="font-semibold text-gray-800">Desglose Financiero</h3>
                        </div>
                        {<div className="text-sm text-gray-500">  {incomeData?.arqueo_number || "XX"}</div>}
                      </div>
                    </div>

                    {/* Encabezados de columnas */}
                    <div className="hidden sm:flex border-t border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                      <div className="w-3/5 py-2 px-4">CONCEPTO</div>
                      <div className="w-2/5 py-2 px-4 text-right">IMPORTE</div>
                    </div>

                    {/* Ítems de la factura */}
                    <div className="border-l border-r border-gray-200">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center py-3 px-4 border-b border-gray-200 hover:bg-gray-50">
                        <div className="w-full sm:w-3/5 mb-1 sm:mb-0">
                          <div className="font-medium">Ingresos Diversos</div>
                          <div className="text-xs text-gray-500 mt-1 sm:hidden">Importe</div>
                        </div>
                        <div className="w-full sm:w-2/5 text-right font-mono">{formatCurrency(incomeData.amountdiverse)}</div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center py-3 px-4 border-b border-gray-200 hover:bg-gray-50">
                        <div className="w-full sm:w-3/5 mb-1 sm:mb-0">
                          <div className="font-medium">Otros Ingresos</div>
                          <div className="text-xs text-gray-500 mt-1 sm:hidden">Importe</div>
                        </div>
                        <div className="w-full sm:w-2/5 text-right font-mono">{formatCurrency(incomeData.other_income)}</div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center py-3 px-4 border-b border-gray-200 hover:bg-gray-50">
                        <div className="w-full sm:w-3/5 mb-1 sm:mb-0">
                          <div className="font-medium">Efectivo Recibido</div>
                          <div className="text-xs text-gray-500 mt-1 sm:hidden">Importe</div>
                        </div>
                        <div className="w-full sm:w-2/5 text-right font-mono">{formatCurrency(incomeData.cash_received)}</div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center py-3 px-4 border-b border-gray-200 hover:bg-gray-50">
                        <div className="w-full sm:w-3/5 mb-1 sm:mb-0">
                          <div className="font-medium">Comisión del Cajero</div>
                          <div className="text-xs text-gray-500 mt-1 sm:hidden">Importe</div>
                        </div>
                        <div className="w-full sm:w-2/5 text-right font-mono">{formatCurrency(incomeData.cashier_commission)}</div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center py-4 px-4 bg-gray-50 border border-gray-200 border-t-0">
                      <div className="w-3/5">
                        <div className="font-bold text-gray-800">TOTAL</div>
                      </div>
                      <div className="w-2/5 text-right">
                        <div className="font-bold text-lg text-blue-700 font-mono">{formatCurrency(incomeData.amount)}</div>
                      </div>
                    </div>

                    {/* Pie de factura */}
                    <div className="py-3 px-4 text-xs text-gray-500 border-l border-r border-b border-gray-200 bg-white">
                      <div className="flex justify-between">
                        <div>Fecha: {renderDate(incomeData.date)}</div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          ) : (
            <div className="text-center py-16">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">No se encontraron detalles para este ingreso.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ViewIncome;