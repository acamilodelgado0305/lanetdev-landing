import React, { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import AccountSelector from "../AccountSelector ";
import CategorySelector from '../CategorySelector';
import { DatePicker, Input, Button, Row, Col, Card, Radio, Typography, Space, Checkbox, Divider } from "antd";
import {
  DollarCircleOutlined, CloseOutlined, PrinterOutlined, DownloadOutlined
} from '@ant-design/icons';
import Swal from "sweetalert2";
import { uploadImage } from "../../../../../services/apiService";
import dayjs from "dayjs";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
const apiUrl = import.meta.env.VITE_API_FINANZAS;
import VoucherSection from "../../components/VoucherSection";

const { Title, Text } = Typography;

const AddIncome = ({ onTransactionAdded, transactionToEdit }) => {
  // ... mantener los estados existentes ...

  const printRef = useRef();

  const renderInvoiceHeader = () => (
    <div className="border-b-2 border-gray-200 pb-4 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">COMPROBANTE DE INGRESO</h1>
          <p className="text-gray-600">No. {arqueoNumber || "---"}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600">Fecha: {date?.format("DD/MM/YYYY")}</p>
          <p className="text-gray-600">Cajero: {cashierName || "---"}</p>
        </div>
      </div>
    </div>
  );

  const renderArqueoInputs = () => {
    if (isArqueoChecked) {
      const calculateTotalAmount = () => {
        const fev = parseFloat(fevAmount) || 0;
        const diverso = parseFloat(diversoAmount) || 0;
        const otros = parseFloat(otherIncome) || 0;
        return fev + diverso + otros;
      };

      const amount = calculateTotalAmount();
      const cashReceivedValue = parseFloat(cashReceived) || 0;
      const isCashMatch = cashReceivedValue === amount;
      const commission = amount * 0.02;

      return (
        <div className="p-6 bg-white rounded-lg shadow-lg space-y-8" ref={printRef}>
          {renderInvoiceHeader()}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <Title level={4}>Periodo de Arqueo</Title>
              <div className="flex space-x-4">
                <DatePicker
                  value={startPeriod}
                  onChange={(date) => setStartPeriod(date)}
                  placeholder="Fecha Inicio"
                  className="w-40"
                />
                <DatePicker
                  value={endPeriod}
                  onChange={(date) => setEndPeriod(date)}
                  placeholder="Fecha Fin"
                  className="w-40"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Title level={4}>Información de Cuenta</Title>
              <AccountSelector
                selectedAccount={account}
                onAccountSelect={(value) => setAccount(value)}
                accounts={accounts}
              />
            </div>
          </div>

          <Divider />

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Title level={5}>Desglose de Ingresos</Title>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Importe FEV:</span>
                    <Input
                      value={formatCurrency(fevAmount)}
                      onChange={(e) => handleAmountChange(e, 'fev')}
                      className="w-40"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Importe Diverso:</span>
                    <Input
                      value={formatCurrency(diversoAmount)}
                      onChange={(e) => handleAmountChange(e, 'diverso')}
                      className="w-40"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Otros Ingresos:</span>
                    <Input
                      value={formatCurrency(otherIncome)}
                      onChange={(e) => handleAmountChange(e, 'other_incomes')}
                      className="w-40"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <Title level={5}>Resumen</Title>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Ingresos:</span>
                    <span className="font-bold text-lg">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efectivo Recibido:</span>
                    <Input
                      value={formatCurrency(cashReceived)}
                      onChange={(e) => handleAmountChange(e, 'cashReceived')}
                      className="w-40"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Comisión (2%):</span>
                    <span className="font-bold">{formatCurrency(commission)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg text-center ${isCashMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isCashMatch ? 'Los valores coinciden correctamente' : '¡Error! Hay un descuadre en el arqueo'}
            </div>
          </div>

          <Divider />

          <div className="space-y-4">
            <Title level={4}>Observaciones</Title>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Añade comentarios adicionales"
              rows={3}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="border-t border-gray-300 w-1/3 pt-4">
              <p className="text-center">Firma del Cajero</p>
            </div>
            <div className="border-t border-gray-300 w-1/3 pt-4">
              <p className="text-center">Firma del Supervisor</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    
    try {
      const element = printRef.current;
      const { jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      const canvas = await html2canvas(element);
      const data = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });
      
      const imgProperties = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
      
      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`arqueo_${arqueoNumber || 'sin_numero'}.pdf`);
      
      Swal.fire({
        icon: 'success',
        title: 'PDF Generado',
        text: 'El comprobante se ha descargado correctamente',
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el PDF. Por favor, intente de nuevo.',
      });
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto bg-white shadow">
      <div className="sticky top-0 z-10 bg-white p-4 shadow-md flex justify-between items-center">
        <Title level={3} className="mb-0">
          Crear un Ingreso
        </Title>
        <Space>
          {isArqueoChecked && (
            <Button
              onClick={handleDownloadPDF}
              type="primary"
              icon={<DownloadOutlined />}
              className="bg-blue-500 text-white"
            >
              Descargar PDF
            </Button>
          )}
          <Button onClick={handleCancel} type="default">
            Cancelar
          </Button>
          <Button onClick={handleSave} type="primary" className="bg-green-500">
            Guardar
          </Button>
        </Space>
      </div>

      <Card bordered={false} className="mt-6">
        <Radio.Group
          value={isArqueoChecked ? 'arqueo' : isVentaChecked ? 'venta' : null}
          onChange={(e) => handleCheckboxChange([e.target.value])}
          className="mb-6"
        >
          <Radio value="arqueo">Arqueo</Radio>
          <Radio value="venta">Venta</Radio>
        </Radio.Group>

        {renderArqueoInputs()}
        {renderVentaInputs()}
      </Card>

      <VoucherSection
        onVoucherChange={setVoucher}
        initialVouchers={voucher ? JSON.parse(voucher) : []}
      />
    </div>
  );
};

export default AddIncome;