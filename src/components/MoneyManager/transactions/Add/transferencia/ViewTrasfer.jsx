import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import axios from "axios";
import { Button, Card, Modal, Typography, Divider, Space } from "antd";
import { CloseOutlined, EditOutlined, ShareAltOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

function ViewTransfer({ entry, visible, onClose, activeTab, accounts = [] }) {
  const [transferData, setTransferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  // Obtener nombre de la cuenta
  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Cuenta no encontrada";
  };

  // Manejador para la tecla Escape
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

  // Cargar datos de la transferencia
  useEffect(() => {
    if (visible && entry?.id) fetchTransferData(entry.id);
  }, [visible, entry]);

  const fetchTransferData = async (id) => {
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || "/api";
      const response = await axios.get(`${API_BASE_URL}/transfers/${id}`);
      setTransferData(response.data);
    } catch (error) {
      console.error("Error fetching transfer data:", error);
      setTransferData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSelected = () =>
    navigate(`/index/moneymanager/transfer/edit/${entry.id}`, {
      state: { returnTab: activeTab },
    });

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(parseFloat(amount))) {
      return "$0,00";
    }
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const renderDate = (date) => {
    if (!date) return "Sin fecha";
    try {
      let parsedDate;
      if (typeof date === "string") {
        const cleanDate = date.endsWith("Z") ? date.substring(0, date.length - 1) : date;
        parsedDate = DateTime.fromISO(cleanDate, { zone: "America/Bogota" });
        if (!parsedDate.isValid) {
          parsedDate = DateTime.fromSQL(cleanDate, { zone: "America/Bogota" });
        }
        if (!parsedDate.isValid) {
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
      <div className="relative w-full h-32 bg-gray-50 border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {isImage ? (
          <img src={url} alt="Comprobante" className="w-full h-full object-cover" />
        ) : isPDF ? (
          <iframe src={url} title="PDF" className="w-full h-full border-0" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">Archivo no soportado</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentImage(url);
              setIsImageModalOpen(true);
            }}
            className="text-white opacity-0 hover:opacity-100"
          >
            Ver
          </Button>
        </div>
      </div>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="95%"
      style={{ maxWidth: 1000 }}
      bodyStyle={{ padding: 0 }}
      centered
      closable={false}
    >
      <Card
        className="w-full bg-white shadow-lg"
        bodyStyle={{ padding: "4px" }}
        bordered={false}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={3} className="mb-1 text-gray-800">
              Comprobante de Transferencia #{transferData?.id || "N/A"}
            </Title>
            <Text type="secondary">Detalles de la transferencia</Text>
          </div>
          <Space>
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              disabled
              className="text-gray-500 hover:text-blue-600"
            />
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={handleEditSelected}
              className="text-gray-500 hover:text-blue-600"
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              className="text-gray-500 hover:text-red-600"
            />
          </Space>
        </div>

        <Divider className="my-4" />

        {/* Cuerpo */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute w-12 h-12 border-4 border-blue-300 border-t-transparent rounded-full animate-spin-slow"></div>
            </div>
            <Text className="mt-4 text-gray-600 text-lg font-medium">
              Cargando detalles de la transferencia...
            </Text>
          </div>
        ) : transferData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Detalles principales */}
            <div className="md:col-span-2">
              <div className="bg-white p-4 border border-gray-200 rounded-md">
                <Title level={5} className="mb-4 text-gray-800">
                  Información de la Transferencia
                </Title>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <Text strong>Fecha:</Text>
                    <br />
                    <Text>{renderDate(transferData.date)}</Text>
                  </div>
                  <div>
                    <Text strong>Monto:</Text>
                    <br />
                    <Text className="text-blue-600 font-semibold">
                      {formatCurrency(transferData.amount)}
                    </Text>
                  </div>
                  <div>
                    <Text strong>De la cuenta:</Text>
                    <br />
                    <Text className="text-blue-600">{getAccountName(transferData.from_account_id)}</Text>
                  </div>
                  <div>
                    <Text strong>A la cuenta:</Text>
                    <br />
                    <Text className="text-green-600">{getAccountName(transferData.to_account_id)}</Text>
                  </div>
                  <div className="sm:col-span-2">
                    <Text strong>Descripción:</Text>
                    <br />
                    <Text>{transferData.description || "Sin descripción"}</Text>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div className="mt-6 bg-white p-4 border border-gray-200 rounded-md">
                <Title level={5} className="mb-4 text-gray-800">
                  Notas
                </Title>
                <Text className="text-gray-600">
                  {transferData.comments || "Sin notas adicionales"}
                </Text>
              </div>
            </div>

            {/* Comprobantes */}
            <div className="md:col-span-1">
              <div className="bg-white p-4 border border-gray-200 rounded-md">
                <Title level={5} className="mb-4 text-gray-800">
                  Comprobantes
                </Title>
                {transferData.vouchers && normalizeVouchers(transferData.vouchers).length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {normalizeVouchers(transferData.vouchers).map((url, index) => (
                      <div key={index}>{renderFilePreview(url)}</div>
                    ))}
                  </div>
                ) : (
                  <Text className="text-gray-500">No hay comprobantes adjuntos</Text>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Text className="text-gray-500">
              No se encontraron detalles para esta transferencia.
            </Text>
          </div>
        )}

        {/* Pie de página */}
        {transferData && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600 flex justify-between">
            <Text>Registrado: {renderDate(transferData?.date)}</Text>
            <Text>Tipo: {transferData?.type || "Transferencia"}</Text>
          </div>
        )}
      </Card>

      {/* Modal para visualizar comprobantes */}
      <Modal
        open={isImageModalOpen}
        onCancel={() => setIsImageModalOpen(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: 1200 }}
        bodyStyle={{ padding: 0, height: "80vh" }}
        centered
      >
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          {currentImage?.endsWith(".pdf") ? (
            <iframe src={currentImage} className="w-full h-full border-0" title="PDF" />
          ) : (
            <img
              src={currentImage}
              alt="Comprobante"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>
      </Modal>

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
    </Modal>
  );
}

export default ViewTransfer;