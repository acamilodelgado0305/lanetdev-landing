import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button, Form, Input, InputNumber, Switch, Typography, Space, Divider } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import axios from "axios";
import dayjs from "dayjs";

const apiUrl = import.meta.env.VITE_API_FINANZAS;
const { Title, Text } = Typography;

const NuevoCajero = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTab = location.state?.activeTab || "cajeros";

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [comisionPorcentaje, setComisionPorcentaje] = useState(0);
  const [importePersonalizado, setImportePersonalizado] = useState(false);

  // Cargar datos si se está editando un cajero
  useEffect(() => {
    if (id) {
      fetchCajeroData();
    }
  }, [id]);

  const fetchCajeroData = async () => {
    try {
      const response = await fetch(`${apiUrl}/cajeros/${id}`);
      if (!response.ok) {
        throw new Error(`No se pudo obtener la información del cajero: ${response.status}`);
      }
      const data = await response.json();
      setNombre(data.nombre || "");
      setComisionPorcentaje(parseFloat(data.comision_porcentaje) || 0);
      setImportePersonalizado(data.importe_personalizado || false);
      form.setFieldsValue({
        nombre: data.nombre || "",
        comision_porcentaje: parseFloat(data.comision_porcentaje) || 0,
        importe_personalizado: data.importe_personalizado || false,
      });
    } catch (error) {
      console.error("Error al obtener los datos del cajero:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la información del cajero. " + error.message,
      });
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const requestBody = {
        nombre: values.nombre,
        comision_porcentaje: parseFloat(values.comision_porcentaje) || 0,
        importe_personalizado: values.importe_personalizado || false,
      };

      const url = id ? `${apiUrl}/cajeros/${id}` : `${apiUrl}/cajeros`;
      const method = id ? "PUT" : "POST";

      const response = await axios({
        method: method,
        url: url,
        data: requestBody,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201 || response.status === 200) {
        Swal.fire({
          icon: "success",
          title: id ? "Cajero Actualizado" : "Cajero Registrado",
          text: id ? "El cajero se ha actualizado correctamente" : "El cajero se ha registrado correctamente",
          confirmButtonColor: "#3085d6",
        }).then(() => {
          navigate("/terceros", { state: { activeTab: "cajeros" } });
        });
      }
    } catch (error) {
      console.error("Error al guardar el cajero:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al procesar el cajero. Por favor, intenta de nuevo.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/terceros", { state: { activeTab: returnTab } });
  };

  const renderCajeroInputs = () => {
    return (
      <div className="p-4">
        {/* Encabezado similar al de AddExpense */}
        <div className="border-b-2 border-gray-200 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">NUEVO CAJERO</h1>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Nombre:</span>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del Cajero"
                  className="w-40"
                />
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center justify-end space-x-4">
                <p className="text-gray-600">Fecha: {dayjs().format("DD/MM/YYYY")}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Descripción:</span>
            <Input
              placeholder="Añade una descripción (opcional)"
              rows={1}
              className="w-[50em] border p-1"
            />
          </div>
        </div>

        <Divider />

        {/* Formulario de datos del cajero */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4">
            <Title level={5}>Información del Cajero</Title>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                nombre: "",
                comision_porcentaje: 0,
                importe_personalizado: false,
              }}
            >
              <Form.Item
                name="nombre"
                label="Nombre del Cajero"
                rules={[{ required: true, message: "Por favor ingresa el nombre del cajero" }]}
              >
                <Input
                  placeholder="Ej: Juan Pérez"
                  onChange={(e) => setNombre(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                name="comision_porcentaje"
                label="Porcentaje de Comisión (%)"
                rules={[
                  { type: "number", min: 0, max: 100, message: "El porcentaje debe estar entre 0 y 100" },
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.1}
                  style={{ width: "100%" }}
                  placeholder="Ej: 2.5"
                  onChange={(value) => setComisionPorcentaje(value)}
                />
              </Form.Item>

              <Form.Item
                name="importe_personalizado"
                label="¿Tiene Importe Personalizado?"
                valuePropName="checked"
              >
                <Switch onChange={(checked) => setImportePersonalizado(checked)} />
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-white">
      {/* Encabezado fijo similar al de AddExpense */}
      <div className="sticky top-0 z-10 bg-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#0052CC] p-2">
            <FileTextOutlined className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#0052CC] text-sm">Cajeros /</span>
            <Title level={3}>{id ? "Editar" : "Nuevo"}</Title>
          </div>
        </div>
        <Space>
          <Button
            onClick={handleCancel}
            className="bg-transparent border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
            style={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            type="primary"
            className="bg-[#0052CC]"
            style={{ borderRadius: 2 }}
            loading={loading}
          >
            Aceptar
          </Button>
        </Space>
      </div>

      {/* Contenido del formulario */}
      {renderCajeroInputs()}
    </div>
  );
};

export default NuevoCajero;