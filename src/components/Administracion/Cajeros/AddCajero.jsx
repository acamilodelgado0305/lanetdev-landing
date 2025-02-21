import React, { useState } from 'react';
import { Input, Button, Typography, Card, InputNumber, Row, Col, Divider } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;

const AddCajero = ({ onCashierAdded }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    responsable: '',
    municipio: '',
    direccion: '',
    comision_porcentaje: 0,
    observaciones: '',
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_TERCEROS}/cajeros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      await response.json();
      Swal.fire({ icon: 'success', title: 'Cajero Registrado', text: 'El cajero se ha registrado correctamente.' });
      if (onCashierAdded) onCashierAdded();
      resetForm();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un error al guardar el cajero.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', responsable: '', municipio: '', direccion: '', comision_porcentaje: 0, observaciones: '' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-md rounded-md border border-gray-200">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#007072] p-2 rounded">
            <FileTextOutlined className=" text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text[#007072] green-400 text-sm">Cajeros /</span>
            <Title level={3} className="!m-0 !p-0">
              Crear
            </Title>
          </div>
        </div>
        <div>


          <Button
            onClick={handleCancel}

            className="bg-transparent mr-2 border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
            style={{ borderRadius: 0 }} // Eliminar redondez de los bordes
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} type="primary" className="bg-[#007072]" style={{ borderRadius: 0 }}>
            Aceptar
          </Button>


        </div>
      </div>

      <Card className="border-none shadow-none">
        <Row gutter={24}>
          <Col span={12}>
            <Title level={5} className="text-gray-700 mb-3">Información Básica</Title>
            <Text strong>Nombre del Cajero*</Text>
            <Input value={formData.nombre} onChange={(e) => handleInputChange('nombre', e.target.value)} placeholder="Ingrese el nombre" className="mb-3" />
            <Text strong>Responsable*</Text>
            <Input value={formData.responsable} onChange={(e) => handleInputChange('responsable', e.target.value)} placeholder="Ingrese el responsable" className="mb-3" />
            <Text strong>Municipio*</Text>
            <Input value={formData.municipio} onChange={(e) => handleInputChange('municipio', e.target.value)} placeholder="Ingrese el municipio" className="mb-3" />
          </Col>
          <Col span={12}>
            <Title level={5} className="text-gray-700 mb-3">Detalles Adicionales</Title>
            <Text strong>Dirección*</Text>
            <Input.TextArea value={formData.direccion} onChange={(e) => handleInputChange('direccion', e.target.value)} placeholder="Ingrese la dirección completa" rows={3} className="mb-3" />
            <Text strong>Porcentaje de Comisión*</Text>
            <InputNumber value={formData.comision_porcentaje} onChange={(value) => handleInputChange('comision_porcentaje', value)} min={0} max={100} formatter={(value) => `${value}%`} parser={(value) => value.replace('%', '')} className="w-full" />
          </Col>
        </Row>
        <Divider />
        <Text strong>Observaciones</Text>
        <Input.TextArea value={formData.observaciones} onChange={(e) => handleInputChange('observaciones', e.target.value)} placeholder="Ingrese observaciones" rows={4} />
      </Card>
    </div>
  );
};

export default AddCajero;
