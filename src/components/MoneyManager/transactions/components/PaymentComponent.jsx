import React, { useState } from 'react';
import {
    Typography,
    Card,
    List,
    Input,
    Button,
    DatePicker,
    Collapse,
    Menu,
    Dropdown,
    Space,
    message,
    Tag,
    Progress,
    Badge
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    DollarOutlined,
    InfoCircleOutlined,
    MoreOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import AddEntryModal from '../addModal';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const PaymentComponent = () => {
    const [payments, setPayments] = useState([]);
    const [newPayment, setNewPayment] = useState('');
    const [paymentDetails, setPaymentDetails] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [activeKey, setActiveKey] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentToEdit, setPaymentToEdit] = useState(null);

    // Calcular el progreso de los pagos completados
    const totalPayments = payments.length;
    const completedPaymentsCount = payments.filter(payment => payment.completed).length;
    const progressPercentage = totalPayments ? Math.round((completedPaymentsCount / totalPayments) * 100) : 0;

    const handleAddPayment = () => {
        if (newPayment.trim() !== '' && paymentAmount > 0) {
            setPayments([
                ...payments,
                {
                    id: payments.length + 1,
                    title: newPayment,
                    details: paymentDetails,
                    amount: paymentAmount,
                    completed: false,
                    date: selectedDate,
                    createdAt: dayjs(),
                },
            ]);
            setNewPayment('');
            setPaymentDetails('');
            setPaymentAmount('');
            setSelectedDate(dayjs());
            message.success('Pago agregado correctamente');
            setActiveKey([]); // Cerrar el panel después de agregar
        } else {
            message.warning('Por favor, ingrese un monto y una descripción válidos');
        }
    };

    const handleTogglePayment = (paymentId) => {
        const updatedPayments = payments.map((payment) =>
            payment.id === paymentId ? { ...payment, completed: !payment.completed } : payment
        );
        setPayments(updatedPayments);
        message.success('Estado del pago actualizado');
    };

    const handleEntryAdded = (newTransaction) => {
        console.log("Transacción añadida:", newTransaction);
        handleModalClose();
    };

    const handleDeletePayment = (paymentId) => {
        const updatedPayments = payments.filter((payment) => payment.id !== paymentId);
        setPayments(updatedPayments);
        message.success('Pago eliminado correctamente');
    };

    // Nueva función para abrir el modal en modo de creación de nuevo pago
    const openNewPaymentModal = () => {
        setPaymentToEdit(null); // Asegurarse de que no haya datos de edición
        setIsModalOpen(true);
    };

    // Función para abrir el modal con datos de un pago específico (modo edición)
    const openPaymentModal = (payment) => {
        setPaymentToEdit({
            amount: payment.amount,
            description: payment.title,
            type: "expense",
            isEditing: true,
        });
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setPaymentToEdit(null);
    };

    const pendingPayments = payments.filter(payment => !payment.completed);
    const completedPayments = payments.filter(payment => payment.completed);

    return (
        <div className="p-4 bg-gray-50 min-h-[20em]">
            <Card className="max-w-2xl mx-auto shadow-lg" bodyStyle={{ padding: '24px' }}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Title level={4} className="mb-1">Mis Pagos</Title>
                        <Text type="secondary">
                            {pendingPayments.length} pendientes, {completedPayments.length} completados
                        </Text>
                    </div>
                    <Progress
                        type="circle"
                        percent={progressPercentage}
                        width={50}
                        format={percent => `${percent}%`}
                    />
                </div>

                <Collapse
                    ghost
                    activeKey={activeKey}
                    onChange={setActiveKey}
                    className="mb-6 bg-blue-50 rounded-lg border border-blue-100"
                >
                    <Panel
                        header={
                            <Space>
                                <PlusOutlined className="text-blue-500" />
                                <Text strong className="text-blue-500">Nuevo Pago</Text>
                            </Space>
                        }
                        key="1"
                        className="border-none"
                    >
                        <div className="space-y-4 p-4">
                            <Input
                                size="large"
                                placeholder="Descripción del pago"
                                value={newPayment}
                                onChange={(e) => setNewPayment(e.target.value)}
                                prefix={<PlusOutlined className="text-gray-400" />}
                                className="border-2 hover:border-blue-400"
                            />
                            <Input
                                size="large"
                                placeholder="Monto del pago"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                prefix={<DollarOutlined className="text-gray-400" />}
                                className="border-2 hover:border-blue-400"
                                type="number"
                            />
                            <DatePicker
                                size="large"
                                value={selectedDate}
                                onChange={setSelectedDate}
                                placeholder="Fecha de pago"
                                format="DD/MM/YYYY"
                                className="w-full border-2 hover:border-blue-400"
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddPayment}
                                size="large"
                                className="w-full"
                            >
                                Crear Pago
                            </Button>
                        </div>
                    </Panel>
                </Collapse>

                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <Title level={5} className="mb-0">Pagos Pendientes</Title>
                            <Tag color="blue">{pendingPayments.length}</Tag>
                        </div>
                        <List
                            className="bg-white rounded-lg shadow-sm"
                            dataSource={pendingPayments}
                            renderItem={(payment) => (
                                <List.Item
                                    className="hover:bg-gray-50 transition-colors"
                                    actions={[
                                        <Button type="text" icon={<MoreOutlined />} onClick={() => openPaymentModal(payment)} />,
                                        <Button type="text" icon={<DeleteOutlined />} onClick={() => handleDeletePayment(payment.id)} danger />,
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={<Text>{payment.title}</Text>}
                                        description={`Monto: $${payment.amount} - Fecha: ${dayjs(payment.date).format('DD MMM YYYY')}`}
                                    />
                                </List.Item>
                            )}
                            locale={{
                                emptyText: (
                                    <div className="py-8 text-center">
                                        <CheckCircleOutlined style={{ fontSize: '2rem' }} className="text-gray-300 mb-2" />
                                        <Text type="secondary" className="block">No hay pagos pendientes</Text>
                                    </div>
                                )
                            }}
                        />
                    </div>
                    {completedPayments.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <Title level={5} className="mb-0">Pagos Completados</Title>
                                <Tag color="green">{completedPayments.length}</Tag>
                            </div>
                            <List
                                className="bg-white rounded-lg shadow-sm opacity-75"
                                dataSource={completedPayments}
                                renderItem={(payment) => (
                                    <List.Item className="hover:bg-gray-50 transition-colors">
                                        <List.Item.Meta
                                            title={<Text delete>{payment.title}</Text>}
                                            description={`Monto: $${payment.amount} - Fecha: ${dayjs(payment.date).format('DD MMM YYYY')}`}
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>
                    )}
                </div>
            </Card>

            <AddEntryModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onTransactionAdded={handleEntryAdded}
                transactionToEdit={paymentToEdit}
            />
        </div>
    );
};

export default PaymentComponent;
