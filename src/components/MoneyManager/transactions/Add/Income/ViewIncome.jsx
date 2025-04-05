import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import axios from "axios";
import { Button, Card, Tooltip, Modal, Input, Divider, Typography } from "antd";
import { CloseOutlined, EditOutlined, ShareAltOutlined, EyeOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAccounts } from "../../../../../services/moneymanager/moneyService";
import { getCajeros } from "../../../../../services/cajeroService";

const { Title } = Typography;

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

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        if (isImageModalOpen) setIsImageModalOpen(false);
        else if (visible) onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isImageModalOpen, visible, onClose]);

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

        // Intentar con ISO primero
        parsedDate = DateTime.fromISO(cleanDate, { zone: "America/Bogota" });

        // Si no funciona, intentar con formato SQL
        if (!parsedDate.isValid) {
          console.log("Intento con fromSQL para:", cleanDate);
          parsedDate = DateTime.fromSQL(cleanDate, { zone: "America/Bogota" });
        }

        // Si aún no es válido, intentar formatos comunes
        if (!parsedDate.isValid) {
          console.log("Intento con formatos personalizados para:", cleanDate);
          const formats = [
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm:ss",
            "dd/MM/yyyy HH:mm:ss",
            "yyyy-MM-dd",
          ];
          for (const format of formats) {
            parsedDate = DateTime.fromFormat(cleanDate, format, { zone: "America/Bogota" });
            if (parsedDate.isValid) break;
          }
        }
      } else if (date instanceof Date) {
        parsedDate = DateTime.fromJSDate(date, { zone: "America/Bogota" });
      }

      if (!parsedDate || !parsedDate.isValid) {
        console.error("No se pudo parsear la fecha:", date, "Valor recibido:", typeof date, date);
        return "Fecha inválida";
      }

      return parsedDate.setLocale("es").toFormat("d 'de' MMMM 'de' yyyy HH:mm");
    } catch (error) {
      console.error("Error al formatear la fecha:", error, "Fecha original:", date);
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

  const renderInvoiceHeader = () => (
    <div className="border-b-2 border-gray-200 ">
      <div className="flex bg-gray-100 p-2 rounded-md justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">COMPROBANTE DE ARQUEO</h1>
          <p className="text-sm text-gray-500">Documento de control interno</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm">
            <span className="text-gray-700 font-semibold">No.</span>
            <Input value={incomeData?.arqueo_number || "N/A"} disabled className="w-30 text-right" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          {/* Título y Fecha */}
          <div className="w-full md:w-2/3">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-gray-600 font-semibold whitespace-nowrap">Título:</span>
              <Input value={incomeData?.description || "N/A"} disabled className="w-full" />
            </div>
            <div className="text-left">

              <div className="bg-white  rounded-lg shadow-sm  space-y-6">

                <div className="space-y-2">
                  <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Cajero</label>
                  <Input value={getCajeroName(incomeData?.cashier_id)} disabled className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-700 font-semibold text-sm uppercase tracking-wide">Donde ingresa el dinero</label>
                  <Input value={getAccountName(incomeData?.account_id)} disabled className="w-full" />
                </div>
              </div>



            </div>
          </div>

          {/* Período de Arqueo a la derecha */}
          <div className="w-full md:w-1/3 text-sm mt-[3em]">
            <Title level={4} className="text-base">Período de Arqueo</Title>
            <div className="space-y-2">
              <div>
                <label className="text-gray-600 font-semibold">Fecha Inicio:</label>
                <Input value={renderDate(incomeData?.start_period)} disabled className="w-full mt-1" />
              </div>
              <div>
                <label className="text-gray-600 font-semibold">Fecha Fin:</label>
                <Input value={renderDate(incomeData?.end_period)} disabled className="w-full mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvoiceDetails = () => {
    const totalAmount = (parseFloat(incomeData?.amountfev) || 0) + (parseFloat(incomeData?.amountdiverse) || 0) + (parseFloat(incomeData?.other_income) || 0) + (parseFloat(incomeData?.amountcustom) || 0);
    const commission = parseFloat(incomeData?.cashier_commission) || 0;
    const cashReceivedValue = parseFloat(incomeData?.cash_received) || 0;

    return (
      <div className="flex flex-col md:flex-row ">
        {/* Columna Izquierda - Información de Cajero y Cuenta */}
        <div className="w-full md:w-96">
          <div>
            <Title level={4}>Comprobantes</Title>
            <div className="grid grid-cols-2 gap-4">
              {incomeData?.voucher && normalizeVouchers(incomeData.voucher).length > 0 ? (
                normalizeVouchers(incomeData.voucher).map((url, index) => <div key={index}>{renderFilePreview(url)}</div>)
              ) : (
                <p className="text-sm text-gray-500 col-span-2 text-center">No hay comprobantes adjuntos</p>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha - Detalles de la Factura */}
        <div className="flex-1 w-full">
          <div className="space-y-6">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-3 text-left font-semibold border-b">Concepto</th>
                    <th className="p-3 text-right font-semibold border-b">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 border-b">Importe FEV</td>
                    <td className="p-3 border-b text-right">{formatCurrency(incomeData?.amountfev)}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 border-b">Importe Diverso</td>
                    <td className="p-3 border-b text-right">{formatCurrency(incomeData?.amountdiverse)}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 border-b">Otros Ingresos</td>
                    <td className="p-3 border-b text-right">{formatCurrency(incomeData?.other_income)}</td>
                  </tr>
                  {incomeData?.amountcustom > 0 && (
                    <>
                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={toggleCustomAmounts}>
                        <td className="p-3 border-b flex items-center">
                          Importes Fijos {incomeData.importes_personalizados?.length > 0 && (isCustomAmountsExpanded ? <UpOutlined className="ml-2" /> : <DownOutlined className="ml-2" />)}
                        </td>
                        <td className="p-3 border-b text-right">{formatCurrency(incomeData.amountcustom)}</td>
                      </tr>
                      {isCustomAmountsExpanded && incomeData.importes_personalizados?.map((item) => (
                        <tr key={item.id_importe} className="bg-gray-50 border-t">
                          <td className="p-2 px-8 text-gray-700">{item.producto} ({item.accion})</td>
                          <td className="p-2 text-right text-gray-700">{item.accion === "suma" ? "+" : "-"}{formatCurrency(item.valor)}</td>
                        </tr>
                      ))}
                    </>
                  )}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="p-3 border-t">Total a Cobrar</td>
                    <td className="p-3 border-t text-right">{formatCurrency(totalAmount)}</td>
                  </tr>

                  <tr className="bg-blue-500 text-white font-bold">
                    <td className="p-3 border-t">Efectivo Recibido</td>
                    <td className="p-3 border-t text-right">{formatCurrency(cashReceivedValue)}</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="p-3 border-b">Comisión</td>
                    <td className="p-3 border-b text-right text-red-600">-{formatCurrency(commission)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Observaciones */}
            

            {/* Comprobantes */}

          </div>
          <div className="space-y-4">
              <Title level={4}>Observaciones</Title>
              <textarea value={incomeData?.comentarios || "Sin notas"} disabled rows={3} className="w-full border p-2" />
            </div>
        </div>
      </div>
    );
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <Card className="w-[95%] max-w-[1100px] max-h-[85vh] bg-white shadow-xl overflow-auto rounded-none" bodyStyle={{ padding: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="p-6 bg-blue-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Ingreso #{incomeData?.arqueo_number || "N/A"}</h1>
            <p className="text-sm text-gray-600">{renderDate(incomeData?.date)}</p>
          </div>
          <div className="flex space-x-3">
            <Button type="text" icon={<ShareAltOutlined />} className="text-gray-600 hover:text-blue-600" disabled />
            <Button type="text" icon={<EditOutlined />} onClick={handleEditSelected} className="text-gray-600 hover:text-blue-600" />
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} className="text-gray-600 hover:text-red-600" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin h-12 w-12 border-t-2 border-blue-500"></div></div>
        ) : incomeData ? (
          <div className="p-6 space-y-8">
            {renderInvoiceHeader()}
            {renderInvoiceDetails()}
            
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">No se encontraron detalles para este ingreso.</div>
        )}

        <div className="p-4 bg-gray-100 border-t border-gray-200 text-sm text-gray-600 flex justify-between">
          <span>Registrado: {renderDate(incomeData?.date)}</span>
          <span>Tipo: {incomeData?.type || "N/A"}</span>
        </div>

        <Modal
          open={isImageModalOpen}
          onCancel={() => setIsImageModalOpen(false)}
          footer={null}
          width="90%"
          style={{ maxWidth: "1600px" }}
          bodyStyle={{ padding: 0, height: "80vh" }}
          centered
        >
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            {currentImage?.endsWith(".pdf") ? <iframe src={currentImage} className="w-full h-full border-0" /> : <img src={currentImage} alt="Comprobante" className="max-w-full max-h-full object-contain" />}
          </div>
        </Modal>
      </Card>
    </div>
  );
}

export default ViewIncome;