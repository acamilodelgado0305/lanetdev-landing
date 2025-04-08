// ActionButtons.js
import React from "react";
import { Button, Tooltip, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, DownloadOutlined, CloseOutlined } from "@ant-design/icons";

const ActionButtons = ({
    handleDeleteSelected, handleDownloadSelected, selectedRowKeys
}) => {
    return (
        <div className="flex items-center space-x-2 mt-[-3em]">
            <Tooltip title="Editar selección">
                <Button
                    type="text"
                    icon={<EditOutlined style={{ fontSize: "15px" }} />}
                    onClick={""}
                    disabled={selectedRowKeys.length !== 1}
                    className="hover:bg-gray-100"
                    style={{
                        width: 30,
                        height: 30,
                        border: "1px solid #d9d9d9",
                        borderRadius: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                />
            </Tooltip>

            <Tooltip title="Eliminar selección">
                <Button
                    type="text"
                    icon={<DeleteOutlined style={{ fontSize: "15px" }} />}
                    disabled={selectedRowKeys.length === 0}
                    onClick={handleDeleteSelected}
                    className="hover:bg-gray-100"
                    style={{
                        width: 30,
                        height: 30,
                        border: "1px solid #d9d9d9",
                        borderRadius: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                />
            </Tooltip>

            <Tooltip title="Descargar selección">
                <Button
                    type="text"
                    icon={<DownloadOutlined style={{ fontSize: "15px" }} />}
                    onClick={handleDownloadSelected}
                    disabled={selectedRowKeys.length !== 1}
                    className="hover:bg-gray-100"
                    style={{
                        width: 30,
                        height: 30,
                        border: "1px solid #d9d9d9",
                        borderRadius: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                />
            </Tooltip>
            <Tooltip title="Limpiar selección">
                <Button
                    type="text"
                    icon={<CloseOutlined style={{ fontSize: "15px" }} />}
                    disabled={selectedRowKeys.length === 0}
                    className="hover:bg-gray-100"
                    style={{
                        width: 30,
                        height: 30,
                        border: "1px solid #d9d9d9",
                        borderRadius: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                />
            </Tooltip>
        </div>
    );
};

export default ActionButtons;
