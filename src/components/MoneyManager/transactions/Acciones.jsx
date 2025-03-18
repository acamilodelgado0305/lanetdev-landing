import React from "react";
import { Button, Select, Divider, Tag, Typography } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import FloatingActionMenu from "./FloatingActionMenu"; // Asegúrate de que la ruta sea correcta
import DateNavigator from "./Add/DateNavigator"; // Asegúrate de que la ruta sea correcta

const { Text } = Typography;

const Acciones = ({
  showFilters,
  setShowFilters,
  selectedRowKeys,
  handleEditSelected,
  handleDeleteSelected,
  handleDownloadSelected,
  handleExportSelected,
  clearSelection,
  activeTab,
  loadingMonthlyData,
  formatCurrency,
  monthlyIncome,
  monthlyExpenses,
  monthlyBalance,
  setDateRange,
  providers,
  setProviderFilter,
  providerFilter,
  setTypeFilter,
  typeFilter,
  filteredEntries,
  setSelectedRowKeys,
}) => {
  return (
    <div className="bg-white py-2 px-5 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>

          <FloatingActionMenu
            selectedRowKeys={selectedRowKeys}
            onEdit={handleEditSelected}
            onDelete={handleDeleteSelected}
            onDownload={handleDownloadSelected}
            onExport={handleExportSelected}
            onClearSelection={clearSelection}
            activeTab={activeTab}
          />
        </div>
        <div className="flex items-center">
          <div className="mr-3">
            <div className="flex items-center justify-end">
              <div className="bg-white px-2 text-center flex-none w-26">
                <h3 className="text-gray-500 text-[10px] font-medium uppercase">Ingresos</h3>
                <p className="text-green-600 text-sm font-semibold mt-1 truncate">
                  {loadingMonthlyData ? "Cargando..." : formatCurrency(monthlyIncome)}
                </p>
              </div>
              <div className="bg-white px-2 text-center flex-none w-26">
                <h3 className="text-gray-500 text-[10px] font-medium uppercase">Egresos</h3>
                <p className="text-red-600 text-sm font-semibold mt-1 truncate">
                  {loadingMonthlyData ? "Cargando..." : formatCurrency(monthlyExpenses)}
                </p>
              </div>
              <div className="px-2 bg-white text-center flex-none w-26">
                <h3 className="text-gray-500 text-[10px] font-medium uppercase">Balance</h3>
                <p className="text-blue-600 text-sm font-semibold mt-1 truncate">
                  {loadingMonthlyData ? "Cargando..." : formatCurrency(monthlyBalance)}
                </p>
              </div>
            </div>
          </div>
          <div>
            <DateNavigator onMonthChange={(dates) => setDateRange(dates)} />
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 p-3 bg-white">
          <div className="flex flex-wrap items-center gap-4">
            <Select
              placeholder="Filtrar por proveedor"
              style={{ width: 200 }}
              onChange={(value) => setProviderFilter(value)}
              value={providerFilter || undefined}
              allowClear
            >
              {providers.map((provider) => (
                <Select.Option key={provider.id} value={provider.id}>
                  {provider.nombre}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="Filtrar por tipo"
              style={{ width: 150 }}
              onChange={(value) => setTypeFilter(value)}
              value={typeFilter || undefined}
              allowClear
            >
              {["commission", "Legal"].map((type) => (
                <Select.Option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Select.Option>
              ))}
            </Select>
            <Divider type="vertical" style={{ height: "24px" }} />
            <div className="flex items-center">
              <Text strong className="mr-2">Seleccionados:</Text>
              <Tag color="blue">
                {selectedRowKeys.length} de {filteredEntries.length} registros
              </Tag>
              {selectedRowKeys.length > 0 && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => setSelectedRowKeys([])}
                >
                  Limpiar selección
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Acciones;