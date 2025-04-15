import React, { useState, useEffect } from "react";
import { Table, Input, Drawer, Button, Checkbox, DatePicker, Dropdown, Menu, Card, Tag, Tooltip, Typography, Divider, Select, Row, Col, Statistic } from "antd";
import { format as formatDate, subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import {
  LeftOutlined,
  RightOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import FloatingActionMenu from "../../FloatingActionMenu"; // Ensure this path is correct
import ViewIncome from "./ViewIncome";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const IncomeTable = ({
  entries = [],
  categories = [],
  accounts = [],
  onDelete,
  onEdit,
  onOpenContentModal,
  activeTab,
  dateRange,
}) => {
  const navigate = useNavigate();

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchText, setSearchText] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState(entries);
  const [typeFilter, setTypeFilter] = useState(null);
  const [cashierFilter, setCashierFilter] = useState(null);
  const [cashiers, setCashiers] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchCashiers();
  }, []);

  // Sincronizar filteredEntries con las entradas recibidas y aplicar filtros adicionales
  useEffect(() => {
    let filtered = [...entries];

    if (typeFilter) {
      filtered = filtered.filter((entry) => entry.type === typeFilter);
    }

    if (cashierFilter) {
      filtered = filtered.filter((entry) => entry.cashier_id === cashierFilter);
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);

      if (isValid(startDate) && isValid(endDate)) {
        filtered = filtered.filter((entry) => {
          const entryDate = new Date(entry.date);
          return isValid(entryDate) && isWithinInterval(entryDate, { start: startDate, end: endDate });
        });
      }
    }

    filtered = filtered.filter((entry) =>
      Object.keys(searchText).every((key) => {
        if (!searchText[key]) return true;
        if (key === "category_id") {
          return getCategoryName(entry[key]).toLowerCase().includes(searchText[key].toLowerCase());
        }
        if (key === "account_id") {
          return getAccountName(entry[key]).toLowerCase().includes(searchText[key].toLowerCase());
        }
        if (key === "cashier_id") {
          return getCashierName(entry[key]).toLowerCase().includes(searchText[key].toLowerCase());
        }
        return entry[key]
          ? entry[key].toString().toLowerCase().includes(searchText[key].toLowerCase())
          : true;
      })
    );

    setFilteredEntries(filtered);
  }, [entries, searchText, typeFilter, cashierFilter, dateRange]);

  const fetchCashiers = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || "/api";
      const response = await axios.get(`${API_BASE_URL}/cajeros`);
      const cashiersArray = response.data.data || [];
      const mappedCashiers = cashiersArray.map((cashier) => ({
        id_cajero: cashier.id_cajero,
        nombre: cashier.nombre,
      }));
      setCashiers(mappedCashiers);
    } catch (error) {
      console.error("Error al obtener los cajeros:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los cajeros. Por favor, intente de nuevo.",
      });
    }
  };

  const getCashierName = (cashierId) => {
    const cashier = cashiers.find((cash) => cash.id_cajero === cashierId);
    return cashier ? cashier.nombre : "Cajero no encontrado";
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
        console.warn("No se pudo parsear la fecha:", date);
        return "Fecha inválida";
      }
      return parsedDate.setLocale("es").toFormat("d 'de' MMMM 'de' yyyy HH:mm");
    } catch (error) {
      console.error("Error al formatear la fecha:", error, "Fecha original:", date);
      return "Fecha inválida";
    }
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    columnWidth: 48,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      {
        key: "none",
        text: "Deseleccionar todo",
        onSelect: () => setSelectedRowKeys([]),
      },
    ],
  };

  const handleEditSelected = () => {
    if (selectedRowKeys.length === 1) {
      navigate(`/index/moneymanager/ingresos/edit/${selectedRowKeys[0]}`, {
        state: { returnTab: activeTab }, // Pasar activeTab como returnTab
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRowKeys.length === 0) {
      Swal.fire({
        title: "Selección vacía",
        text: "Por favor, seleccione al menos un registro para eliminar.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Entendido",
      });
      return;
    }

    Swal.fire({
      title: "¿Está seguro?",
      text: `¿Desea eliminar ${selectedRowKeys.length} registro(s) seleccionado(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || "/api";
          const deletePromises = selectedRowKeys.map((id) =>
            axios.delete(`${API_BASE_URL}/incomes/${id}`)
          );
          const responses = await Promise.all(deletePromises);

          // Verificar si alguna eliminación resultó en un saldo negativo
          const hasNegativeBalance = responses.some(
            (response) => response.data.data.warning
          );

          // Actualizar el estado local eliminando las entradas borradas
          const updatedEntries = filteredEntries.filter(
            (entry) => !selectedRowKeys.includes(entry.id)
          );
          setFilteredEntries(updatedEntries);

          // Notificar al componente padre para actualizar las entradas globales
          if (onDelete) {
            const entriesToDelete = filteredEntries.filter((entry) =>
              selectedRowKeys.includes(entry.id)
            );
            entriesToDelete.forEach((entry) =>
              onDelete({ ...entry, entryType: "expense" })
            );
          }

          // Limpiar selección
          setSelectedRowKeys([]);

          // Mostrar mensaje de éxito
          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "Los ingresos seleccionados han sido eliminados exitosamente.",
            confirmButtonColor: "#3085d6",
          }).then(() => {
            // Si hay saldo negativo, mostrar una advertencia adicional
            if (hasNegativeBalance) {
              Swal.fire({
                icon: "warning",
                title: "Advertencia",
                text: "Una o más cuentas tienen ahora un saldo negativo después de la eliminación.",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Entendido",
              });
            }
          });
        } catch (error) {
          console.error("Error al eliminar los ingresos:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron eliminar los ingresos. Por favor, intente de nuevo.",
            confirmButtonColor: "#3085d6",
          });
        }
      }
    });
  };


  // New function to handle copying selected items to clipboard
  const handleCopySelected = () => {
    const selectedItems = filteredEntries.filter((item) => selectedRowKeys.includes(item.id));
    const textToCopy = selectedItems
      .map((item) => {
        return `N° Arqueo: ${item.arqueo_number || "N/A"}, Descripción: ${item.description}, Fecha: ${renderDate(item.date)}, Cuenta: ${getAccountName(item.account_id)}, Cajero: ${getCashierName(item.cashier_id)}, Monto: ${formatCurrency(item.amount)}, Desde: ${renderDate(item.start_period)}, Hasta: ${renderDate(item.end_period)}`;
      })
      .join("\n");

    navigator.clipboard.writeText(textToCopy).then(() => {
      Swal.fire({
        icon: "success",
        title: "Copiado",
        text: "Los elementos seleccionados han sido copiados al portapapeles.",
        confirmButtonColor: "#3085d6",
      });
    }).catch((error) => {
      console.error("Error al copiar al portapapeles:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo copiar al portapapeles. Por favor, intente de nuevo.",
        confirmButtonColor: "#3085d6",
      });
    });
  };





  const handleDownloadSelected = () => {
    if (selectedRowKeys.length === 0) {
      Swal.fire({
        title: "Selección vacía",
        text: "Por favor, seleccione al menos un registro",
        icon: "warning",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Entendido",
      });
      return;
    }
    const selectedItems = filteredEntries.filter((item) => selectedRowKeys.includes(item.id));
    generateInvoicePDF(selectedItems);
  };

  const handleSearch = (value, dataIndex) => {
    setSearchText((prev) => ({
      ...prev,
      [dataIndex]: value.toLowerCase(),
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Cuenta no encontrada";
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Categoría no encontrada";
  };

  const openDrawer = (images) => {
    setSelectedImages(images);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedImages([]);
  };

  const generateInvoicePDF = (items) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Nombre de la Empresa", 14, 30);
    doc.text("NIT: 123456789-0", 14, 36);
    doc.text("Dirección: Calle 123 #45-67, Bogotá, Colombia", 14, 42);
    doc.text("Teléfono: +57 123 456 7890", 14, 48);
    doc.text(`Fecha: ${formatDate(new Date(), "d MMMM yyyy", { locale: es })}`, 140, 30);
    doc.text(`Factura N°: ${Math.floor(Math.random() * 1000000)}`, 140, 36);

    const tableData = items.map((item) => [
      item.arqueo_number || "N/A",
      item.description,
      renderDate(item.date),
      getAccountName(item.account_id),
      getCashierName(item.cashier_id),
      formatCurrency(item.amount),
      renderDate(item.start_period),
      renderDate(item.end_period),
    ]);

    autoTable(doc, {
      startY: 60,
      head: [["N° Arqueo", "Descripción", "Fecha", "Cuenta", "Cajero", "Monto", "Desde", "Hasta"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
      },
    });

    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(totalAmount)}`, 140, doc.lastAutoTable.finalY + 10);
    doc.setFontSize(10);
    doc.text("Gracias por su negocio", 105, 280, { align: "center" });
    doc.text("Este documento no tiene validez fiscal", 105, 286, { align: "center" });
    doc.save(`Factura_Ingresos_${formatDate(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const columns = [
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
          Fecha y Hora
          <input
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => handleSearch(e.target.value, "date")}
            style={{
              marginTop: 2,
              padding: 4,
              height: 28,
              fontSize: 12,
              border: "1px solid #d9d9d9",
              borderRadius: 4,
              outline: "none",
            }}
          />
        </div>
      ),
      dataIndex: "date",
      key: "date",
      render: (text) => renderDate(text),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      sortDirections: ["descend", "ascend"],
      width: 180,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
          N° Arqueo
          <input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            onChange={(e) => handleSearch(e.target.value, "arqueo_number")}
            style={{
              marginTop: 2,
              padding: 4,
              height: 28,
              fontSize: 12,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              outline: 'none',
            }}
          />
        </div>
      ),
      dataIndex: "arqueo_number",
      key: "arqueo_number",
      sorter: (a, b) => a.arqueo_number - b.arqueo_number,
      render: (text) => <a>{text || "No disponible"}</a>,
      width: 110,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "2px 0", gap: 1, lineHeight: 1 }}>
          Titulo
          <input
            prefix={<SearchOutlined style={{ color: '#d9d9d9' }} />}
            onChange={(e) => handleSearch(e.target.value, "description")}
            style={{
              marginTop: 2,
              padding: 4,
              height: 28,
              fontSize: 12,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              outline: 'none',
            }}
          />
        </div>
      ),
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
      sortDirections: ["ascend", "descend"],
      ellipsis: true,
      width: 300,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
          Cuenta
          <input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            onChange={(e) => handleSearch(e.target.value, "account_id")}
            style={{
              marginTop: 2,
              padding: 4,
              height: 28,
              fontSize: 12,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              outline: 'none',
            }}
          />
        </div>
      ),
      dataIndex: "account_id",
      key: "account_id",
      render: (id) => <Tag color="blue">{getAccountName(id)}</Tag>,
      sorter: (a, b) => getAccountName(a.account_id).localeCompare(getAccountName(b.account_id)),
      sortDirections: ["ascend", "descend"],
      width: 150,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
          Cajero
          <input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            onChange={(e) => handleSearch(e.target.value, "cashier_id")}
            style={{
              marginTop: 2,
              padding: 4,
              height: 28,
              fontSize: 12,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              outline: 'none',
            }}
          />
        </div>
      ),
      dataIndex: "cashier_id",
      key: "cashier_id",
      sorter: (a, b) => getCashierName(a.cashier_id).localeCompare(getCashierName(b.cashier_id)),
      render: (cashierId) => <Tag color="purple">{getCashierName(cashierId)}</Tag>,
      width: 150,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
          Monto Total
          <input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            onChange={(e) => handleSearch(e.target.value, "cash_received")}
            style={{
              marginTop: 2,
              padding: 4,
              height: 28,
              fontSize: 12,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              outline: 'none',
            }}
          />
        </div>
      ),
      dataIndex: "cash_received",
      key: "cash_received",
      render: (cashReceived, record) => {
        const totalAmount = parseFloat(record.amount) || 0;
        const cashReceivedValue = parseFloat(cashReceived) || 0;
        const difference = cashReceivedValue - totalAmount;
        const isCashMatch = Math.abs(difference) < 0.01;

        let indicator = null;
        if (record.type === "arqueo" && !isCashMatch) {
          if (difference > 0) {
            indicator = <span className="text-green-600 font-bold ml-2">$</span>;
          } else if (difference < 0) {
            indicator = <span className="text-red-600 font-bold ml-2">-$</span>;
          }
        }

        return (
          <span className="flex items-center justify-end">
            <span className="font-bold">{formatCurrency(cashReceivedValue)}</span>
            {indicator}
          </span>
        );
      },
      sorter: (a, b) => (parseFloat(a.cash_received) || 0) - (parseFloat(b.cash_received) || 0),
      sortDirections: ["descend", "ascend"],
      width: 140,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
          Desde
          <input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            onChange={(e) => handleSearch(e.target.value, "start_period")}
            style={{
              marginTop: 2,
              padding: 4,
              height: 28,
              fontSize: 12,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              outline: 'none',
            }}
          />
        </div>
      ),
      dataIndex: "start_period",
      key: "start_period",
      render: (text) => renderDate(text),
      sorter: (a, b) => new Date(a.start_period || 0) - new Date(b.start_period || 0),
      sortDirections: ["descend", "ascend"],
      width: 120,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
          Hasta
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            onChange={(e) => handleSearch(e.target.value, "end_period")}
            style={{
              marginTop: 2,
              padding: 4,
              height: 28,
              fontSize: 12,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              outline: 'none',
            }}
          />
        </div>
      ),
      dataIndex: "end_period",
      key: "end_period",
      render: (text) => renderDate(text),
      sorter: (a, b) => new Date(a.end_period || 0) - new Date(b.end_period || 0),
      sortDirections: ["descend", "ascend"],
      width: 120,
    },
    {
      title: "Comprobante",
      dataIndex: "voucher",
      key: "voucher",
      render: (vouchers) => (
        Array.isArray(vouchers) && vouchers.length > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip title="Comprobantes disponibles">
              <CheckCircleOutlined style={{ color: 'green', fontSize: 24 }} />
            </Tooltip>
            <Button
              type="link"
              onClick={(e) => {
                e.stopPropagation();
                openDrawer(vouchers);
              }}
              style={{ padding: 0, height: 'auto' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Tooltip title="Sin comprobantes">
              <CloseCircleOutlined style={{ color: 'red', fontSize: 24 }} />
            </Tooltip>
          </div>
        )
      ),
      width: 130,
    },
  ];

  return (
    <div className="px-5 py-2 bg-white">

      <Table
        rowSelection={rowSelection}
        dataSource={filteredEntries}
        columns={columns}
        rowKey={(record) => record.id}
        pagination={false}
        bordered
        size="middle"
        className="thick-bordered-table custom-checkbox-size"
        onRow={(record) => ({
          onClick: (e) => {
            const { tagName } = e.target;
            if (tagName !== "INPUT" && tagName !== "BUTTON" && tagName !== "A") {
              rowSelection.onChange([record.id], [record]);
              setSelectedEntry(record);
              setIsViewModalOpen(true);
            }
          },
        })}
        rowClassName="hover:bg-gray-50 transition-colors"
        scroll={{ x: "max-content", y: 700 }} // Ajusta 'y' según tus necesidades
      />

      {/* Add the FloatingActionMenu here */}
      <FloatingActionMenu
        selectedCount={selectedRowKeys.length}
        onEdit={handleEditSelected}
        onCopy={handleCopySelected}
        onDelete={handleDeleteSelected}
        visible={selectedRowKeys.length > 0}
      />

      <ViewIncome
        entry={selectedEntry}
        visible={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        activeTab={activeTab}
      />

      <Drawer
        visible={isDrawerOpen}
        onClose={closeDrawer}
        placement="right"
        width={420}
        title="Comprobantes de ingresos"
        extra={
          selectedImages.length > 1 && (
            <Button
              type="primary"
              onClick={() => downloadAllImages(selectedImages)}
              icon={<DownloadOutlined />}
            >
              Descargar todas
            </Button>
          )
        }
      >
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-4 justify-center mb-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative w-60 h-80">
                <img
                  src={image}
                  alt={`Comprobante ${index + 1}`}
                  className="w-full h-full object-cover border rounded-md"
                />
                <Button
                  type="primary"
                  className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                  onClick={() => downloadImage(image)}
                  icon={<DownloadOutlined />}
                >
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default IncomeTable;