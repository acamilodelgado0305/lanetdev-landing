import React, { useState, useEffect } from "react";
import { Input, Button, Popover, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import FloatingActionMenu from "./MenuIconosFlotantes";
import Swal from "sweetalert2";
import "./CustomTable.css";

// Componente para las columnas arrastrables
const SortableColumn = ({ col, handleSearch }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: col.key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    background: isDragging ? "#e6f7ff" : "#f5f5f5",
  };

  return (
    <th ref={setNodeRef} style={style} {...attributes} {...listeners} className="draggable-column">
      <div className="column-header">
        <span className="column-title">{col.title}</span>
        <Input
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value, col.dataIndex)}
          placeholder={`Buscar ${col.title}`}
          className="search-input"
        />
      </div>
    </th>
  );
};

const TableData = ({ entries = [], loading, onDelete, onRefresh }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [columnsConfig, setColumnsConfig] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [searchText, setSearchText] = useState({});

  // Generar columnas cuando cambien las entradas
  useEffect(() => {
    if (entries && entries.length > 0) {
      generateColumns(entries);
      setFilteredEntries(entries);
    } else {
      setFilteredEntries([]);
    }
  }, [entries]);

  const generateColumns = (data) => {
    if (!data || data.length === 0) return;
    
    const firstEntry = data[0];
    // Solo procesamos las propiedades que no son funciones u objetos complejos
    const dynamicColumns = Object.keys(firstEntry)
      .filter(key => 
        typeof firstEntry[key] !== 'function' && 
        typeof firstEntry[key] !== 'object' &&
        key !== 'key' // Excluimos la propiedad key que es para React
      )
      .map((key) => ({
        key,
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "), // Reemplaza todos los guiones bajos
        dataIndex: key,
        render: (value) => (value !== null && value !== undefined ? String(value) : "N/A"),
      }));
      
    console.log("Columnas generadas:", dynamicColumns);
    setColumnsConfig(dynamicColumns);
    setVisibleColumns(dynamicColumns.map((col) => col.key));
  };

  const handleSearch = (value, dataIndex) => {
    const newSearchText = { ...searchText, [dataIndex]: value.toLowerCase() };
    setSearchText(newSearchText);

    const filtered = entries.filter((entry) =>
      Object.keys(newSearchText).every((key) => {
        const entryValue = entry[key];
        const searchValue = newSearchText[key] || "";
        return entryValue !== null && entryValue !== undefined
          ? String(entryValue).toLowerCase().includes(searchValue)
          : searchValue === "";
      })
    );
    setFilteredEntries(filtered);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = columnsConfig.findIndex((col) => col.key === active.id);
    const newIndex = columnsConfig.findIndex((col) => col.key === over.id);

    const reorderedColumns = Array.from(columnsConfig);
    const [movedColumn] = reorderedColumns.splice(oldIndex, 1);
    reorderedColumns.splice(newIndex, 0, movedColumn);
    setColumnsConfig(reorderedColumns);
  };

  const toggleColumnVisibility = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  };

  const handleDeleteSelected = () => {
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

    Swal.fire({
      title: "¿Está seguro?",
      text: `¿Desea eliminar ${selectedRowKeys.length} registro(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const deletePromises = selectedRowKeys.map((id) => onDelete(id));
        Promise.all(deletePromises)
          .then(() => {
            Swal.fire("¡Eliminado!", "Los registros han sido eliminados.", "success");
            setSelectedRowKeys([]);
            onRefresh(); // Refrescar datos después de eliminar
          })
          .catch((error) => {
            Swal.fire("Error", "Hubo un problema al eliminar los registros.", "error");
          });
      }
    });
  };

  const visibleColumnsConfig = columnsConfig.filter((col) => visibleColumns.includes(col.key));
  const sensors = useSensors(useSensor(PointerSensor));

  const columnConfigContent = (
    <div>
      {columnsConfig.map((col) => (
        <div key={col.key} className="flex items-center mb-2">
          <Checkbox
            checked={visibleColumns.includes(col.key)}
            onChange={() => toggleColumnVisibility(col.key)}
          >
            {col.title}
          </Checkbox>
        </div>
      ))}
    </div>
  );

  const getIdField = () => {
    // Detectar el nombre del campo ID que estamos usando
    if (entries && entries.length > 0) {
      if ('id_proveedor' in entries[0]) return 'id_proveedor';
      if ('id_cajero' in entries[0]) return 'id_cajero';
      if ('id' in entries[0]) return 'id';
      // Buscar cualquier campo que comience con 'id_'
      const idField = Object.keys(entries[0]).find(key => key.startsWith('id_'));
      return idField || 'key'; // Fallback a 'key' si no encontramos nada
    }
    return 'key';
  };

  const idField = getIdField();

  return (
    <div className="custom-table-container">
      {loading ? (
        <div className="loading">Cargando...</div>
      ) : filteredEntries.length === 0 ? (
        <div className="no-data">No hay datos disponibles</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="selection-column">
                    <Checkbox
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRowKeys(filteredEntries.map((entry) => entry[idField]));
                        } else {
                          setSelectedRowKeys([]);
                        }
                      }}
                      checked={selectedRowKeys.length === filteredEntries.length && filteredEntries.length > 0}
                    />
                  </th>
                  <SortableContext
                    items={visibleColumnsConfig.map((col) => col.key)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {visibleColumnsConfig.map((col) => (
                      <SortableColumn key={col.key} col={col} handleSearch={handleSearch} />
                    ))}
                  </SortableContext>
                  <th className="config-column">
                    <Popover content={columnConfigContent} title="Configurar Columnas" trigger="click">
                      <Button size="small">Configurar</Button>
                    </Popover>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => (
                  <tr key={entry[idField] || `row-${index}`} className="table-row">
                    <td className="selection-column">
                      <Checkbox
                        checked={selectedRowKeys.includes(entry[idField])}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRowKeys([...selectedRowKeys, entry[idField]]);
                          } else {
                            setSelectedRowKeys(selectedRowKeys.filter((key) => key !== entry[idField]));
                          }
                        }}
                      />
                    </td>
                    {visibleColumnsConfig.map((col) => (
                      <td key={`${entry[idField]}-${col.key}`} className="table-cell">
                        {col.render(entry[col.dataIndex])}
                      </td>
                    ))}
                    <td className="config-column"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DndContext>
      )}

      <FloatingActionMenu
        selectedRowKeys={selectedRowKeys}
        onDelete={handleDeleteSelected}
        onEdit={() => console.log("Editar no implementado")}
        onDownload={() => console.log("Descargar no implementado")}
        onExport={() => console.log("Exportar no implementado")}
        onClearSelection={() => setSelectedRowKeys([])}
      />
    </div>
  );
};

export default TableData;