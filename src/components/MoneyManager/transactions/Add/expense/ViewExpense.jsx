import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import axios from "axios";
import { Button, Card, Tooltip, Modal } from "antd";
import { CloseOutlined, EditOutlined, ShareAltOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAccounts } from "../../../../../services/moneymanager/moneyService";

function ViewExpense({ entry, visible, onClose, activeTab }) {
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    if (visible && entry?.id) fetchExpenseData(entry.id);
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

  const getAccountName = (accountId) => accounts.find((acc) => acc.id === accountId)?.name || "No asignada";

  const handleEditSelected = () => navigate(`/index/moneymanager/egresos/edit/${entry.id}`, { state: { returnTab: activeTab } });

  const formatCurrency = (amount) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount || 0);

  const renderDate = (date) => {
    if (!date) return "Sin fecha";
    const parsedDate = typeof date === "string" ? DateTime.fromISO(date, { zone: "America/Bogota" }) : DateTime.fromJSDate(date, { zone: "America/Bogota" });
    return parsedDate.isValid ? parsedDate.setLocale("es").toFormat("d 'de' MMMM 'de' yyyy HH:mm") : "Fecha inválida";
  };

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
      <div className="relative w-full h-40 bg-gray-50  border border-gray-200 overflow-hidden shadow-sm">
        {isImage ? <img src={url} alt="Comprobante" className="w-full h-full object-cover" /> : isPDF ? <iframe src={url} title="PDF" className="w-full h-full border-0" /> : null}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all">
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setCurrentImage(url); setIsImageModalOpen(true); }} className="text-white opacity-0 hover:opacity-100" />
        </div>
      </div>
    );
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <Card className="w-[95%] max-w-[1600px] max-h-[85vh] bg-white shadow-xl  overflow-auto" bodyStyle={{ padding: 0 }} onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="p-6 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "SF Pro Display, sans-serif" }}>Egreso #{expenseData?.invoice_number || "N/A"}</h1>
            <p className="text-sm text-gray-600">{renderDate(expenseData?.date)}</p>
          </div>
          <div className="flex space-x-3">
            <Button type="text" icon={<ShareAltOutlined />} className="text-gray-600 hover:text-blue-600" disabled />
            <Button type="text" icon={<EditOutlined />} onClick={handleEditSelected} className="text-gray-600 hover:text-blue-600" />
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} className="text-gray-600 hover:text-red-600" />
          </div>
        </div>

        {/* Cuerpo */}
        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin  h-12 w-12 border-t-2 border-blue-500"></div></div>
        ) : expenseData ? (
          <div className="p-6 grid grid-cols-3 gap-6">
            {/* Detalles y tabla */}
            <div className="col-span-2">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: "SF Pro Display, sans-serif" }}>Detalles</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
                  <div><span className="font-medium">Cuenta:</span> {getAccountName(expenseData.account_id)}</div>
                  <div><span className="font-medium">Tipo:</span> {expenseData.type || "N/A"}</div>
                </div>
              </div>

              <table className="w-full text-sm border border-gray-200 ">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="py-3 px-4 text-left font-semibold">Producto</th>
                    <th className="py-3 px-4 text-center font-semibold">Cantidad</th>
                    <th className="py-3 px-4 text-center font-semibold">Precio Unitario</th>
                    <th className="py-3 px-4 text-center font-semibold">Impuesto (%)</th>
                    <th className="py-3 px-4 text-center font-semibold">Retención (%)</th>
                    <th className="py-3 px-4 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {expenseData.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-3 px-4"><div>{item.product_name}</div><div className="text-xs text-gray-500">{item.description}</div></td>
                      <td className="py-3 px-4 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-center">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 px-4 text-center">{item.tax_charge || 0}%</td>
                      <td className="py-3 px-4 text-center">{item.tax_withholding || 0}%</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumen, notas y comprobantes */}
            <div className="col-span-1">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: "SF Pro Display, sans-serif" }}>Resumen</h2>
                <div className="bg-gray-50 p-4  border border-gray-200 text-sm text-gray-700" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
                  <div className="flex justify-between mb-2"><span>Total Bruto</span><span>{formatCurrency(expenseData.total_gross)}</span></div>
                  <div className="flex justify-between mb-2"><span>Descuentos</span><span className="text-green-600">-{formatCurrency(expenseData.discounts)}</span></div>
                  <div className="flex justify-between mb-2"><span>Subtotal</span><span>{formatCurrency(expenseData.subtotal)}</span></div>
                  {expenseData.ret_vat !== "0.00" && (
                    <div className="flex justify-between mb-2"><span>IVA ({expenseData.ret_vat_percentage}%)</span><span className="text-red-600">{formatCurrency(expenseData.ret_vat)}</span></div>
                  )}
                  {expenseData.ret_ica !== "0.00" && (
                    <div className="flex justify-between mb-2"><span>Retención ({expenseData.ret_ica_percentage}%)</span><span className="text-green-600">-{formatCurrency(expenseData.ret_ica)}</span></div>
                  )}
                  <div className="flex justify-between mb-2"><span>Total Impuestos</span><span className={expenseData.total_impuestos >= 0 ? "text-red-600" : "text-green-600"}>{expenseData.total_impuestos >= 0 ? "" : "-"}{formatCurrency(Math.abs(expenseData.total_impuestos))}</span></div>
                  <div className="flex justify-between border-t pt-2 font-semibold"><span>Total Neto</span><span className="text-red-600">{formatCurrency(expenseData.total_net)}</span></div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: "SF Pro Display, sans-serif" }}>Notas</h2>
                <p className="text-sm text-gray-600 bg-gray-50 p-4  border border-gray-200">{expenseData.comments || "Sin notas"}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: "SF Pro Display, sans-serif" }}>Comprobantes</h2>
                <div className="grid grid-cols-2 gap-4">
                  {expenseData.voucher && normalizeVouchers(expenseData.voucher).length > 0 ? (
                    normalizeVouchers(expenseData.voucher).map((url, index) => <div key={index}>{renderFilePreview(url)}</div>)
                  ) : (
                    <p className="text-sm text-gray-500 col-span-2 text-center">No hay comprobantes adjuntos</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">No se encontraron detalles para este egreso.</div>
        )}

        {/* Pie de página */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 text-sm text-gray-600 flex justify-between" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
          <span>Registrado: {renderDate(expenseData?.date)}</span>
          <span>Tipo: {expenseData?.type || "N/A"}</span>
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

export default ViewExpense;