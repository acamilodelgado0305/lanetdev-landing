import React from "react";
import { Modal, Descriptions } from "antd";

const ProviderDetailsModal = ({ isOpen, onClose, provider }) => {
    if (!provider) return null;

    return (
        <Modal
            title="Detalles del Proveedor"
            open={isOpen}
            onCancel={onClose}
            footer={null}
        >
            <Descriptions column={1} bordered>
                <Descriptions.Item label="Tipo de Identificación">
                    {provider.tipo_identificacion}
                </Descriptions.Item>
                <Descriptions.Item label="Número de Identificación">
                    {provider.numero_identificacion}
                </Descriptions.Item>
                <Descriptions.Item label="Dígito de Verificación">
                    {provider.dv || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Tipo de Persona">
                    {provider.tipo_persona}
                </Descriptions.Item>
                <Descriptions.Item label="Razón Social">
                    {provider.razon_social}
                </Descriptions.Item>
                <Descriptions.Item label="Nombre Comercial">
                    {provider.nombre_comercial}
                </Descriptions.Item>
                <Descriptions.Item label="Dirección">
                    {provider.direccion}
                </Descriptions.Item>
                <Descriptions.Item label="Ciudad">
                    {provider.ciudad}
                </Descriptions.Item>
                <Descriptions.Item label="Departamento">
                    {provider.departamento}
                </Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                    {provider.telefono}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                    {provider.email}
                </Descriptions.Item>
                <Descriptions.Item label="Código Postal">
                    {provider.codigo_postal || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Código Actividad Económica">
                    {provider.codigo_actividad_economica || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Responsabilidad Fiscal">
                    {provider.responsabilidad_fiscal || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Matrícula Mercantil">
                    {provider.matricula_mercantil || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Estado">
                    {provider.estado ? "Activo" : "Inactivo"}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default ProviderDetailsModal;
