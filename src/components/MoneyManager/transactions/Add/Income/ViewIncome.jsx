import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import axios from "axios";
import { Button, Card, Tooltip, Modal } from "antd";
import { CloseOutlined, EditOutlined, ShareAltOutlined, EyeOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAccounts } from "../../../../../services/moneymanager/moneyService";
import { getCajeros } from "../../../../../services/cajeroService";

function ViewIncome({ entry, visible, onClose, activeTab }) {
  const [incomeData, setIncomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [cajeros, setCajeros] = useState([]);
  const [isCustomAmountsExpanded, setIsCustomAmountsExpanded] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    if (visible && entry?.id) fetchIncomeData(entry.id);
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
      setCajeros(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error("Error al obtener los cajeros:", error);
      setCajeros([]);
    }
  };

  const getAccountName = (accountId) => accounts.find((acc) => acc.id === accountId)?.name || "No asignada";
  const getCajeroName = (cashierId) => cajeros.find((cjr) => cjr.id_cajero === cashierId)?.nombre || "No asignado";

  const handleEditSelected = () => navigate(`/index/moneymanager/ingresos/edit/${entry.id}`, { state: { returnTab: activeTab } });

  const formatCurrency = (amount) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount || 0);

  const renderDate = (date) => {
    if (!date) {
      console.log("Fecha recibida es nula o indefinida:", date);
      return "Sin fecha";
    }

    try {
      let parsedDate;

      if (typeof date === "string") {
        const cleanDate = date.endsWith("Z") ? date.substring(0, date.length - 1) : date;
        parsedDate = DateTime.fromISO(cleanDate, { zone: "America/Bogota" });
        if (!parsedDate.isValid) {
          parsedDate = DateTime.fromSQL(cleanDate, { zone: "America/Bogota" });
        }
        if (!parsedDate.isValid) {
          const formats = ["yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd'T'HH:mm:ss", "dd/MM/yyyy HH:mm:ss", "yyyy-MM-dd"];
          for (const format of formats) {
            parsedDate = DateTime.fromFormat(cleanDate, format, { zone: "America/Bogota" });
            if (parsedDate.isValid) break;
          }
        }
      } else if (date instanceof Date) {
        parsedDate = DateTime.fromJSDate(date, { zone: "America/Bogota" });
      }

      if (!parsedDate || !parsedDate.isValid) {
        console.error("No se pudo parsear la fecha:", date);
        return "Fecha inválida";
      }

      return parsedDate.setLocale("es").toFormat("d 'de' MMMM 'de' yyyy HH:mm");
    } catch (error) {
      console.error("Error al formatear la fecha:", error);
      return "Fecha inválida";
    }
  };

  const toggleCustomAmounts = () => setIsCustomAmountsExpanded(!isCustomAmountsExpanded);

  const normalizeVouchers = (vouchers) => {
    if (Array.isArray(vouchers)) return vouchers;
    if (typeof vouchers === "string") {
      try {
        const parsed = JSON.parse(vouchers);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Error parsing vouchers:", error);
        return [];
      }
    }
    return [];
  };

  const renderFilePreview = (url) => {
    const isImage = /\.(jpg|png|gif)$/i.test(url);
    const isPDF = url.endsWith(".pdf");
    return (
      <div className="relative w-full h-40 bg-gray-50 border border-gray-200 overflow-hidden shadow-sm">
        {isImage ? <img src={url} alt="Comprobante" className="w-full h-full object-cover" /> : isPDF ? <iframe src={url} title="PDF" className="w-full h-full border-0" /> : null}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all">
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setCurrentImage(url); setIsImageModalOpen(true); }} className="text-white opacity-0 hover:opacity-100" />
        </div>
      </div>
    );
  };

  const renderDiscrepancyMessage = () => {
    if (!incomeData || incomeData.type !== "arqueo") return null;

    const totalAmount = parseFloat(incomeData.amount) || 0;
    const cashReceivedValue = parseFloat(incomeData.cash_received) || 0;
    const difference = cashReceivedValue - totalAmount;
    const isCashMatch = Math.abs(difference) < 0.01;

    let messageText, messageClass, differenceText;

    if (isCashMatch) {
      messageText = "Valores coinciden";
      messageClass = "bg-green-100 text-green-700";
      differenceText = "";
    } else if (difference > 0) {
      messageText = "Excedente";
      messageClass = "bg-yellow-100 text-yellow-700";
      differenceText = `+${formatCurrency(difference)}`;
    } else {
      messageText = "Déficit";
      messageClass = "bg-red-100 text-red-700";
      differenceText = `-${formatCurrency(Math.abs(difference))}`;
    }

    return (
      <div className={`p-2 rounded-md mb-2 ${messageClass} text-sm`}>
        <div className="flex justify-between items-center">
          <span className="font-semibold">{messageText}</span>
          {!isCashMatch && (
            <span className="text-right">
              {differenceText}
            </span>
          )}
        </div>
        {!isCashMatch && (
          <div className="mt-1 text-xs">
            <div>Esperado: {formatCurrency(totalAmount)}</div>
            <div>Recibido: {formatCurrency(cashReceivedValue)}</div>
          </div>
        )}
      </div>
    );
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <Card className="w-[95%] max-w-[1200px] max-h-[85vh] bg-white shadow-xl overflow-auto" bodyStyle={{ padding: 0 }} onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="p-6 bg-blue-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "SF Pro Display, sans-serif" }}>Ingreso #{incomeData?.arqueo_number || "N/A"}</h1>
            <p className="text-sm text-gray-600">{renderDate(incomeData?.date)}</p>
          </div>
          <div className="flex space-x-3">
            <Button type="text" icon={<ShareAltOutlined />} className="text-gray-600 hover:text-blue-600" disabled />
            <Button type="text" icon={<EditOutlined />} onClick={handleEditSelected} className="text-gray-600 hover:text-blue-600" />
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} className="text-gray-600 hover:text-red-600" />
          </div>
        </div>

        {/* Cuerpo */}
        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin h-12 w-12 border-t-2 border-blue-500"></div></div>
        ) : incomeData ? (
          <div className="p-6 grid grid-cols-3 gap-6">
            {/* Detalles y tabla */}
            <div className="col-span-2">
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
                  <div><span className="font-semibold">Título:</span> {incomeData.description}</div>
                  <div><span className="font-semibold">Cajero:</span> {getCajeroName(incomeData.cashier_id)}</div>
                  <div><span className="font-semibold">Tipo:</span> {incomeData.type || "N/A"}</div>
                  <div><span className="font-semibold">Cuenta:</span> {getAccountName(incomeData.account_id)}</div>
                  <div className="col-span-2"><span className="font-semibold">Período:</span> {renderDate(incomeData.start_period)} - {renderDate(incomeData.end_period)}</div>
                </div>
              </div>

              <table className="w-[50em] text-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="py-3 px-4 text-left font-semibold">Concepto</th>
                    <th className="py-3 px-4 text-right font-semibold">Importe</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  <tr className="border-t"><td className="py-3 px-4">Importe FEV</td><td className="py-3 px-4 text-right">{formatCurrency(incomeData.amountfev)}</td></tr>
                  <tr className="border-t"><td className="py-3 px-4">Ingresos Diversos</td><td className="py-3 px-4 text-right">{formatCurrency(incomeData.amountdiverse)}</td></tr>
                  <tr className="border-t"><td className="py-3 px-4">Otros Ingresos</td><td className="py-3 px-4 text-right">{formatCurrency(incomeData.other_income)}</td></tr>
                  {incomeData.amountcustom > 0 && (
                    <>
                      <tr className="border-t cursor-pointer" onClick={toggleCustomAmounts}>
                        <td className="py-3 px-4 flex items-center">Importes Fijos {incomeData.importes_personalizados?.length > 0 && (isCustomAmountsExpanded ? <UpOutlined className="ml-2" /> : <DownOutlined className="ml-2" />)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(incomeData.amountcustom)}</td>
                      </tr>
                      {isCustomAmountsExpanded && incomeData.importes_personalizados?.map((item) => (
                        <tr key={item.id_importe} className="bg-gray-50 border-t">
                          <td className="py-2 px-8 text-gray-700">{item.producto} ({item.accion})</td>
                          <td className="py-2 px-4 text-right text-gray-700">{item.accion === "suma" ? "+" : "-"}{formatCurrency(item.valor)}</td>
                        </tr>
                      ))}
                    </>
                  )}
                  <tr className="border-t font-semibold"><td className="py-3 px-4">Total Ingresos</td><td className="py-3 px-4 text-right text-green-600">{formatCurrency(incomeData.amount)}</td></tr>
                  <tr className="border-t"><td className="py-3 px-4">Comisión del Cajero</td><td className="py-3 px-4 text-right text-red-600">-{formatCurrency(incomeData.cashier_commission)}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Resumen, discrepancia, notas y comprobantes */}
            <div className="col-span-1">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: "SF Pro Display, sans-serif" }}>Resumen</h2>
                <div className="bg-gray-50 p-4 border border-gray-200 text-sm text-gray-700" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
                  <div className="flex justify-between mb-2"><span>Total Ingresos</span><span>{formatCurrency(incomeData.amount)}</span></div>
                  <div className="flex justify-between mb-2"><span>Comisión</span><span className="text-red-600">-{formatCurrency(incomeData.cashier_commission)}</span></div>
                  <div className="flex justify-between border-t pt-2 font-semibold"><span>Efectivo Recibido</span><span className="text-green-600">{formatCurrency(incomeData.cash_received)}</span></div>
                </div>
              </div>

              {renderDiscrepancyMessage()}

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: "SF Pro Display, sans-serif" }}>Notas</h2>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 border border-gray-200">{incomeData.comentarios || "Sin notas"}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: "SF Pro Display, sans-serif" }}>Comprobantes</h2>
                <div className="grid grid-cols-2 gap-4">
                  {incomeData.voucher && normalizeVouchers(incomeData.voucher).length > 0 ? (
                    normalizeVouchers(incomeData.voucher).map((url, index) => <div key={index}>{renderFilePreview(url)}</div>)
                  ) : (
                    <p className="text-sm text-gray-500 col-span-2 text-center">No hay comprobantes adjuntos</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">No se encontraron detalles para este ingreso.</div>
        )}

        {/* Pie de página */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 text-sm text-gray-600 flex justify-between" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
          <span>Registrado: {renderDate(incomeData?.date)}</span>
          <span>Tipo: {incomeData?.type || "N/A"}</span>
        </div>

        {/* Modal */}
        <Modal open={isImageModalOpen} onCancel={() => setIsImageModalOpen(false)} footer={null} width="90%" style={{ maxWidth: "1600px" }} bodyStyle={{ padding: 0, height: "80vh" }} centered>
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            {currentImage?.endsWith(".pdf") ? <iframe src={currentImage} className="w-full h-full border-0" /> : <img src={currentImage} alt="Comprobante" className="max-w-full max-h-full object-contain" />}
          </div>
        </Modal>
      </Card>
    </div>
  );
}

export default ViewIncome;