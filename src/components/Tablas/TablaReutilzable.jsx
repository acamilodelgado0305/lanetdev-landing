import React, { useState } from 'react';
import { Table, Button, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';



const TablaReutilizableComponent = ({ columns, dataSource, onCreate, rowSelection }) => {
    const [data, setData] = useState(dataSource || []);
    const [isCreating, setIsCreating] = useState(false);
    const [newRow, setNewRow] = useState({});

    const handleCreateClick = () => {
        if (isCreating) {
            message.warning('Ya estás creando una nueva fila');
            return;
        }
        setIsCreating(true);
        setNewRow({});
    };

    const handleInputChange = (key, value) => {
        setNewRow(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        if (Object.keys(newRow).length === 0) {
            message.error('Debes completar al menos un campo');
            return;
        }
        const newData = [...data, { ...newRow, key: Date.now().toString() }];
        setData(newData);
        setIsCreating(false);
        setNewRow({});
        if (onCreate) {
            onCreate(newRow);
        }
        message.success('Fila creada exitosamente');
    };

    const handleCancel = () => {
        setIsCreating(false);
        setNewRow({});
    };

    const extendedColumns = columns.map(col => ({
        ...col,
        render: (text, record, index) => {
            if (isCreating && index === data.length) {
                return (
                    <Input
                        placeholder={`Ingrese ${col.title}`}
                        value={newRow[col.dataIndex] || ''}
                        onChange={(e) => handleInputChange(col.dataIndex, e.target.value)}
                        onPressEnter={handleSave}
                    />
                );
            }
            return col.render ? col.render(text, record, index) : text;
        },
    }));

    const tableData = isCreating ? [...data, { key: 'new-row' }] : data;

    return (
        <div className="tabla-reutilizable-container">
            <Table
                columns={extendedColumns}
                dataSource={tableData}
                rowSelection={rowSelection}
                pagination={false}
                bordered
                rowClassName={(record, index) =>
                    isCreating && index === data.length ? 'editable-row' : ''
                }
                footer={() => (
                    <div className="flex justify-between items-center p-2">
                        <Button
                            type="link"
                            icon={<PlusOutlined />}
                            onClick={handleCreateClick}
                            disabled={isCreating}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Crear
                        </Button>
                        {isCreating && (
                            <div>
                                <Button
                                    type="primary"
                                    onClick={handleSave}
                                    className="mr-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    Guardar
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    className="border-gray-300 text-gray-700"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            />
        </div>
    );
};

const styles = `
    .tabla-reutilizable-container .ant-table {
        border-radius: 8px;
        overflow: hidden;
    }
    .tabla-reutilizable-container .ant-table-thead > tr > th {
        background-color: #fafafa;
        font-weight: 600;
        color: #172b4d;
    }
    .tabla-reutilizable-container .editable-row {
        background-color: #f5f5f5;
    }
    .tabla-reutilizable-container .ant-table-footer {
        background-color: #fff;
        border-top: 1px solid #e8e8e8;
    }
`;

const StyleSheet = () => <style>{styles}</style>;

const TablaReutilizable = (props) => (
    <>
        <StyleSheet />
        <TablaReutilizableComponent {...props} />
    </>
);

export default TablaReutilizable;