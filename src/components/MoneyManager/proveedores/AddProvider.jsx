import React, { useState, useEffect } from "react";
import { Button, Input, Select, Form, Switch } from "antd";
import {
    CloseOutlined,
    UserOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    MailOutlined,
    FileTextOutlined,
    BarcodeOutlined,
    GlobalOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";

const { Option } = Select;

const apiUrl = import.meta.env.VITE_API_FINANZAS;

const AddProvider = ({ isOpen, onClose, onProviderAdded, providerToEdit }) => {
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (providerToEdit) {
            setIsEditing(true);
            form.setFieldsValue(providerToEdit);
        } else {
            setIsEditing(false);
            form.resetFields();
        }
    }, [providerToEdit, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            console.log(values);
            const method = isEditing ? "PUT" : "POST";
            const endpoint = isEditing
                ? `${apiUrl}/providers/${providerToEdit.id}`
                : `${apiUrl}/providers`;

            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            Swal.fire({
                icon: "success",
                title: isEditing ? "Proveedor Actualizado" : "Proveedor Registrado",
                text: "El proveedor se ha guardado correctamente.",
                confirmButtonColor: "#3085d6",
            });

            onClose();
            if (onProviderAdded) onProviderAdded();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo guardar el proveedor. Inténtalo de nuevo.",
                confirmButtonColor: "#d33",
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="fixed inset-y-0 right-0 w-full md:w-[32em] bg-white shadow-2xl overflow-y-auto"
                style={{ transition: "transform 0.3s ease-in-out" }}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white z-10">
                    <div className="px-6 pt-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <UserOutlined className="text-blue-500 text-xl" />
                            <h2 className="text-xl font-semibold text-gray-800">
                                {isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
                            </h2>
                        </div>
                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={onClose}
                            className="hover:bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center"
                        />
                    </div>
                    <div className="h-1 bg-blue-500" />
                </div>

                {/* Formulario */}
                <div className="p-6 space-y-4">
                    <Form form={form} layout="vertical">
                        <Form.Item
                            label="Tipo de Identificación"
                            name="tipo_identificacion"
                            rules={[{ required: true, message: "Campo requerido" }]}
                        >
                            <Select placeholder="Seleccione el tipo">
                                <Option value="NIT">NIT</Option>
                                <Option value="CC">Cédula de Ciudadanía</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Número de Identificación"
                            name="numero_identificacion"
                            rules={[{ required: true, message: "Campo requerido" }]}
                        >
                            <Input prefix={<BarcodeOutlined />} />
                        </Form.Item>

                        <Form.Item label="DV" name="dv">
                            <Input prefix={<FileTextOutlined />} />
                        </Form.Item>

                        <Form.Item
                            label="Tipo de Persona"
                            name="tipo_persona"
                            rules={[{ required: true, message: "Campo requerido" }]}
                        >
                            <Select placeholder="Seleccione el tipo">
                                <Option value="Jurídica">Jurídica</Option>
                                <Option value="Natural">Natural</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Razón Social"
                            name="razon_social"
                            rules={[{ required: true, message: "Campo requerido" }]}
                        >
                            <Input prefix={<UserOutlined />} />
                        </Form.Item>

                        <Form.Item label="Nombre Comercial" name="nombre_comercial">
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Tipo de Régimen"
                            name="tipo_regimen"
                            rules={[{ required: true, message: "Campo requerido" }]}
                        >
                            <Select placeholder="Seleccione el régimen">
                                <Option value="Simplificado">Simplificado</Option>
                                <Option value="Común">Común</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="Dirección" name="direccion">
                            <Input prefix={<HomeOutlined />} />
                        </Form.Item>

                        <Form.Item label="Ciudad" name="ciudad">
                            <Input prefix={<EnvironmentOutlined />} />
                        </Form.Item>

                        <Form.Item label="Departamento" name="departamento">
                            <Input />
                        </Form.Item>

                        <Form.Item label="País" name="pais" initialValue="Colombia">
                            <Input prefix={<GlobalOutlined />} />
                        </Form.Item>

                        <Form.Item label="Teléfono" name="telefono">
                            <Input prefix={<PhoneOutlined />} />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Campo requerido" },
                                { type: "email", message: "Ingrese un correo válido" },
                            ]}
                        >
                            <Input prefix={<MailOutlined />} />
                        </Form.Item>

                        <Form.Item label="Código Postal" name="codigo_postal">
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Responsabilidad Fiscal"
                            name="responsabilidad_fiscal"
                            rules={[{ required: true, message: "Campo requerido" }]}
                        >
                            <Select placeholder="Seleccione la responsabilidad">
                                <Option value="R-99-NG">R-99-NG</Option>
                                <Option value="R-99-PN">R-99-PN</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item label="Matrícula Mercantil" name="matricula_mercantil">
                            <Input />
                        </Form.Item>

                        <Form.Item label="Estado" name="estado" valuePropName="checked">
                            <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                block
                                className="bg-blue-500 hover:bg-blue-600"
                                onClick={handleSave}
                            >
                                {isEditing ? "Actualizar Proveedor" : "Registrar Proveedor"}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default AddProvider;
