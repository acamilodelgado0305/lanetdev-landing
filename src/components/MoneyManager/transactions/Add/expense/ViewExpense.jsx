import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import axios from "axios";
import { Button, Card, Tooltip, Modal } from "antd";
import { CloseOutlined, EditOutlined, ShareAltOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function ViewExpense({ entry, visible, onClose, activeTab }) {
  const [expenseData, setExpenseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  // Agregar manejador para la tecla Esc
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && visible) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  useEffect(() => {
    if (visible && entry?.id) fetchExpenseData(entry.id);
  }, [visible, entry]);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchExpenseData = async (id) => {
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || "/api";
      const response = await axios.get(`${API_BASE_URL}/expenses/${id}`);
      setExpenseData(response.data);
    } catch (error) {
      console.error("Error fetching expense data:", error);
      setExpenseData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || "/api";
      const response = await axios.get(`${API_BASE_URL}/terceros`);
      const providersArray = response.data;
      if (Array.isArray(providersArray) && providersArray.length > 0) {
        setProviders(providersArray);
      } else {
        setProviders([]);
      }
    } catch (error) {
      console.error("Error al obtener los proveedores:", error);
      setProviders([]);
    }
  };

  const getProviderName = (providerId) => {
    if (!providerId) return "Proveedor no especificado";
    const provider = providers.find((provider) => provider.id === providerId);
    return provider ? provider.nombre : "Proveedor no encontrado";
  };

  const handleEditSelected = () => navigate(`/index/moneymanager/egresos/edit/${entry.id}`, { state: { returnTab: activeTab } });

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return '$0,00';
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const formatTableDiscount = (discount) => {
    const value = parseFloat(discount);
    if (isNaN(value)) return "0";
    return value <= 100 ? `${value.toFixed(2)}%` : formatCurrency(value);
  };

  const formatPercentage = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0.00%";
    return `${num.toFixed(2)}%`;
  };

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

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <Card className="w-[95%] max-w-[1400px] max-h-[85vh] bg-white shadow-xl overflow-auto" bodyStyle={{ padding: 0 }} onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="p-6 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "SF Pro Display, sans-serif" }}>
              Egreso {expenseData?.invoice_number || "N/A"}
            </h1>
            <div className="text-sm text-gray-600" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
              <p><span className="font-bold">No. Factura Proveedor:</span> {expenseData?.provider_invoice_prefix ? `${expenseData.provider_invoice_prefix}-${expenseData.provider_invoice_number}` : expenseData?.provider_invoice_number || "N/A"}</p>
              <p>{renderDate(expenseData?.date)}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button type="text" icon={<ShareAltOutlined />} className="text-gray-600 hover:text-blue-600" disabled />
            <Button type="text" icon={<EditOutlined />} onClick={handleEditSelected} className="text-gray-600 hover:text-blue-600" />
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} className="text-gray-600 hover:text-red-600" />
          </div>
        </div>

        {/* Cuerpo */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full animate-spin-slow"></div>
            </div>
            <p className="mt-4 text-gray-600 text-lg font-medium" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
              Cargando detalles del egreso...
            </p>
          </div>
        ) : expenseData ? (
          <div className="p-6 grid grid-cols-3 gap-6">
            {/* Detalles y tabla */}
            <div className="col-span-2">
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
                  <div>
                    <span className="font-bold">Cuenta:</span>{" "}
                    <span style={{ color: "#f97316" }}>{expenseData.account || "No asignada"}</span>
                  </div>
                  <div>
                    <span className="font-bold">Tipo:</span> {expenseData.type || "N/A"}
                  </div>
                  <div>
                    <span className="font-bold">Descripción:</span> {expenseData.description || "Sin descripción"}
                  </div>
                  <div>
                    <span className="font-bold">Estado:</span> {expenseData.estado ? "Activo" : "Inactivo"}
                  </div>
                  <div>
                    <span className="font-bold">Proveedor:</span> {getProviderName(expenseData.provider_id)}
                  </div>
                  <div>
                    <span className="font-bold">Categoría:</span>{" "}
                    <span style={{ color: "#a855f7" }}>{expenseData.category || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-bold">Etiqueta:</span>{" "}
                    <span style={{ color: "#22c55e" }}>{expenseData.etiqueta || "N/A"}</span>
                  </div>
                </div>
              </div>

              <table className="w-full text-sm border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="py-3 px-4 text-left font-semibold">Producto</th>
                    <th className="py-3 px-4 text-center font-semibold">Cantidad</th>
                    <th className="py-3 px-4 text-center font-semibold">Precio Unitario</th>
                    <th className="py-3 px-4 text-center font-semibold">Descuento</th>
                    <th className="py-3 px-4 text-center font-semibold">Impuesto (%)</th>
                    <th className="py-3 px-4 text-center font-semibold">Retención (%)</th>
                    <th className="py-3 px-4 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {expenseData.items && expenseData.items.length > 0 ? (
                    expenseData.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="py-3 px-4">{item.product_name || "N/A"}</td>
                        <td className="py-3 px-4 text-center">{item.quantity || 0}</td>
                        <td className="py-3 px-4 text-center">{formatCurrency(item.unit_price)}</td>
                        <td className="py-3 px-4 text-center">{formatTableDiscount(item.discount)}</td>
                        <td className="py-3 px-4 text-center">{formatPercentage(item.tax_charge)}</td>
                        <td className="py-3 px-4 text-center">{formatPercentage(item.tax_withholding)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(item.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-3 px-4 text-center text-gray-500">
                        No hay ítems asociados a este egreso.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Resumen, notas y comprobantes */}
            <div className="col-span-1">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: "SF Pro Display, sans-serif" }}>Resumen</h2>
                <div className="bg-gray-50 p-4 border border-gray-200 text-sm text-gray-700" style={{ fontFamily: "SF Pro Text, sans-serif" }}>
                  <div className="flex justify-between mb-2"><span>Total Bruto</span><span>{formatCurrency(expenseData.total_gross)}</span></div>
                  <div className="flex justify-between mb-2"><span>Descuentos</span><span className="text-green-600">-{formatCurrency(expenseData.discounts)}</span></div>
                  <div className="flex justify-between mb-2"><span>Subtotal</span><span>{formatCurrency(expenseData.subtotal)}</span></div>
                  <div className="flex justify-between mb-2"><span>Retefuente</span><span>{formatCurrency(expenseData.ret_ica)}</span></div>
                  <div className="flex justify-between mb-2"><span>IVA</span><span>{formatCurrency(expenseData.ret_vat)}</span></div>
                  <div className="flex justify-between mb-2"><span>Total Impuestos</span><span>{formatCurrency(expenseData.total_impuestos)}</span></div>
                  <div className="flex justify-between border-t pt-2 font-semibold"><span>Total Neto</span><span className="text-red-600">{formatCurrency(expenseData.total_net)}</span></div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-3" style={{ fontFamily: "SF Pro Display, sans-serif" }}>Notas</h2>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 border border-gray-200">{expenseData.comments || "Sin notas"}</p>
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
            {currentImage?.endsWith(".pdf") ? (
              <iframe src={currentImage} className="w-full h-full border-0" />
            ) : (
              <img src={currentImage} alt="Comprobante" className="max-w-full max-h-full object-contain" />
            )}
          </div>
        </Modal>
      </Card>

      {/* Estilos personalizados para el loading */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default ViewExpense;