import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Drawer,
  Button,
  Checkbox,
  DatePicker,
  Card,
  Tag,
  Tooltip,
  Space,
  Typography,
  Divider,
  Select,
} from "antd";
import {
  format as formatDate,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isValid,
} from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import {
  LeftOutlined,
  RightOutlined,
  DownloadOutlined,
  FilterOutlined,
  DeleteOutlined,
  SearchOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import FloatingActionMenu from "../FloatingActionMenu";
import ViewTransfer from "../Add/transferencia/ViewTrasfer";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const TransactionTable = ({
  categories = [],
  accounts = [],
  activeTab,
  dateRange, // Recibimos dateRange como prop
  selectedRowKeys: externalSelectedRowKeys,
  setSelectedRowKeys: setExternalSelectedRowKeys,
}) => {
  const navigate = useNavigate();

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [searchText, setSearchText] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [monthlyBalance, setMonthlyBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [loadingMonthlyData, setLoadingMonthlyData] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Sincronizamos selectedRowKeys con el prop externo
  useEffect(() => {
    setSelectedRowKeys(externalSelectedRowKeys);
  }, [externalSelectedRowKeys]);

  // Fetch data cuando el componente se monta o cuando cambia dateRange
  useEffect(() => {
    fetchData();
  }, [dateRange]);

  useEffect(() => {
    fetchMonthlyData();
  }, [currentMonth]);

  // Simular carga cuando cambian filtros
  const simulateLoading = () => {
    setEntriesLoading(true);
    setTimeout(() => {
      setEntriesLoading(false);
    }, 500);
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...entries];

    // Filtro por tipo
    if (typeFilter) {
      filtered = filtered.filter((entry) => entry.type === typeFilter);
    }

    // Filtro por fecha usando el prop dateRange
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);

      if (isValid(startDate) && isValid(endDate)) {
        filtered = filtered.filter((entry) => {
          const entryDate = new Date(entry.date);
          return (
            isValid(entryDate) &&
            isWithinInterval(entryDate, { start: startDate, end: endDate })
          );
        });
      }
    }

    // Filtro por texto de búsqueda
    filtered = filtered.filter((entry) =>
      Object.keys(searchText).every((key) => {
        if (!searchText[key]) return true;
        if (key === "from_account_id" || key === "to_account_id") {
          return getAccountName(entry[key])
            .toLowerCase()
            .includes(searchText[key].toLowerCase());
        }
        return entry[key]
          ? entry[key].toString().toLowerCase().includes(searchText[key].toLowerCase())
          : true;
      })
    );

    setFilteredEntries(filtered);
  }, [entries, searchText, dateRange, typeFilter]);

  const handleTypeFilterChange = (value) => {
    setTypeFilter(value);
  };

  const fetchData = async () => {
    setEntriesLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || "/api";
      const response = await axios.get(`${API_BASE_URL}/transfers`);
      const sortedEntries = response.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setEntries(sortedEntries);
      setFilteredEntries(sortedEntries);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error al cargar los datos");
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los datos. Intente nuevamente.",
        icon: "error",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Entendido",
      });
    } finally {
      setEntriesLoading(false);
    }
  };

  const fetchMonthlyData = () => {
    // Implementar si es necesario
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setExternalSelectedRowKeys(newSelectedRowKeys); // Sincronizamos con el padre
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
        onSelect: () => {
          setSelectedRowKeys([]);
          setExternalSelectedRowKeys([]);
        },
      },
    ],
  };

  const handleEditSelected = () => {
    if (selectedRowKeys.length === 1) {
      navigate(`/index/moneymanager/transfer/edit/${selectedRowKeys[0]}`, {
        state: { returnTab: activeTab },
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
            axios.delete(`${API_BASE_URL}/transfers/${id}`)
          );
          await Promise.all(deletePromises);

          const updatedEntries = filteredEntries.filter(
            (entry) => !selectedRowKeys.includes(entry.id)
          );
          setFilteredEntries(updatedEntries);
          setEntries(updatedEntries);
          setSelectedRowKeys([]);
          setExternalSelectedRowKeys([]);

          Swal.fire({
            icon: "success",
            title: "Eliminado",
            text: "Los registros seleccionados han sido eliminados exitosamente.",
            confirmButtonColor: "#3085d6",
          });
        } catch (error) {
          console.error("Error al eliminar los registros:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron eliminar los registros. Por favor, intente de nuevo.",
            confirmButtonColor: "#3085d6",
          });
        }
      }
    });
  };

  const handleBatchOperation = (operation) => {
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

    const selectedItems = entries.filter((item) => selectedRowKeys.includes(item.id));

    switch (operation) {
      case "delete":
        handleDeleteSelected();
        break;
      case "export":
        console.log("Exportar seleccionados:", selectedItems);
        break;
      default:
        break;
    }
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
    }).format(amount);
  };

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Cuenta no encontrada";
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Categoría no encontrada";
  };

  const downloadImage = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("No se pudo descargar el archivo.");
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = url.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
    }
  };

  const downloadAllImages = async (urls) => {
    try {
      await Promise.all(urls.map((url) => downloadImage(url)));
    } catch (error) {
      console.error("Error al descargar las imágenes:", error);
    }
  };

  const openDrawer = (images) => {
    setSelectedImages(images);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedImages([]);
  };

  const columns = [
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
          <Text strong>Fecha</Text>
          <Input
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
      render: (text) => formatDate(new Date(text), "d 'de' MMMM 'de' yyyy", { locale: es }),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      sortDirections: ["descend", "ascend"],
      width: 180,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
          <Text strong>De la cuenta</Text>
          <Input
            onChange={(e) => handleSearch(e.target.value, "from_account_id")}
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
      dataIndex: "from_account_id",
      key: "from_account_id",
      render: (id) => <Tag color="blue">{getAccountName(id)}</Tag>,
      sorter: (a, b) =>
        getAccountName(a.from_account_id).localeCompare(getAccountName(b.from_account_id)),
      sortDirections: ["ascend", "descend"],
      width: 150,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
          <Text strong>A la cuenta</Text>
          <Input
            onChange={(e) => handleSearch(e.target.value, "to_account_id")}
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
      dataIndex: "to_account_id",
      key: "to_account_id",
      render: (id) => <Tag color="green">{getAccountName(id)}</Tag>,
      sorter: (a, b) =>
        getAccountName(a.to_account_id).localeCompare(getAccountName(b.to_account_id)),
      sortDirections: ["ascend", "descend"],
      width: 150,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
          <Text strong>Monto</Text>
          <Input
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => handleSearch(e.target.value, "amount")}
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
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <span className="font-semibold text-gray-700">{formatCurrency(amount)}</span>
      ),
      sorter: (a, b) => a.amount - b.amount,
      sortDirections: ["descend", "ascend"],
      width: 120,
    },
    {
      title: (
        <div className="flex flex-col" style={{ margin: "2px 0", gap: 1, lineHeight: 1 }}>
          <Text strong>Título</Text>
          <Input
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => handleSearch(e.target.value, "description")}
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
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
      sortDirections: ["ascend", "descend"],
      ellipsis: true,
      width: 200,
      render: (text) => (
        <div
          style={{
            maxWidth: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {text || "No disponible"}
        </div>
      ),
    },
    {
      title: "Comprobante",
      dataIndex: "vouchers",
      key: "vouchers",
      render: (vouchers) =>
        Array.isArray(vouchers) && vouchers.length > 0 ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Tooltip title="Comprobantes disponibles">
              <CheckCircleOutlined style={{ color: "green", fontSize: 24 }} />
            </Tooltip>
            <Button
              type="link"
              onClick={(e) => {
                e.stopPropagation();
                openDrawer(vouchers);
              }}
              style={{ padding: 0, height: "auto" }}
            />
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Tooltip title="Sin comprobantes">
              <CloseCircleOutlined style={{ color: "red", fontSize: 24 }} />
            </Tooltip>
          </div>
        ),
      width: 130,
    },
  ];

  return (
    <div className="px-6 py-4 bg-gray-50 rounded-lg shadow-sm">
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded border border-red-200">
          <p className="font-medium">{error}</p>
          <Button type="primary" danger onClick={fetchData} className="mt-2">
            Reintentar
          </Button>
        </div>
      )}

      <Table
        rowSelection={rowSelection}
        dataSource={filteredEntries}
        columns={columns}
        rowKey={(record) => record.id}
        bordered
        size="middle"
        loading={entriesLoading}
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
        scroll={{ x: "max-content", y: 700 }}
      />

      <FloatingActionMenu
        selectedCount={selectedRowKeys.length}
        onEdit={handleEditSelected}
        onDelete={handleDeleteSelected}
        visible={selectedRowKeys.length > 0}
        onExport={() => handleBatchOperation("export")}
      />

      <ViewTransfer
        entry={selectedEntry}
        visible={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedEntry(null);
        }}
        activeTab={activeTab}
        accounts={accounts}
      />

      <Drawer
        visible={isDrawerOpen}
        onClose={closeDrawer}
        placement="right"
        width={420}
        title="Comprobantes de transferencias"
        extra={
          selectedImages.length > 1 && (
            <Button
              type="primary"
              onClick={() => downloadAllImages(selectedImages)}
              icon={<DownloadOutlined />}
              style={{ borderRadius: "6px", height: "40px" }}
            >
              Descargar Todas
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
                  className="w-full h-full object-cover border rounded-md shadow-sm"
                />
                <Button
                  type="primary"
                  className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                  onClick={() => downloadImage(image)}
                  icon={<DownloadOutlined />}
                  style={{ borderRadius: "6px", height: "40px" }}
                >
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Drawer>

      <style>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          padding: 12px 16px;
          font-size: 13px;
          text-transform: uppercase;
        }
        .custom-table .ant-table-tbody > tr > td {
          padding: 12px 16px;
          font-size: 14px;
          color: #4b5563;
          border-bottom: 1px solid #e5e7eb;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f9fafb;
        }
        .custom-table .ant-checkbox-wrapper {
          cursor: default;
        }
        .custom-table .ant-tag {
          margin-right: 0;
          padding: 2px 8px;
          font-size: 12px;
          border-radius: 4px;
        }
        .custom-table .ant-input {
          border-radius: 4px;
          border: 1px solid #d1d5db;
          font-size: 12px;
        }
        .custom-table .ant-input:hover, .custom-table .ant-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .hover\\:bg-gray-50:hover {
          background-color: #f9fafb;
        }
        .transition-colors {
          transition: background-color 0.3s ease;
        }
        .thick-bordered-table {
          border: 1px solid #e5e7eb;
        }
        .custom-checkbox-size .ant-checkbox-inner {
          width: 20px;
          height: 20px;
        }
        .custom-checkbox-size .ant-checkbox-inner::after {
          width: 6px;
          height: 10px;
        }
      `}</style>
    </div>
  );
};

export default TransactionTable;