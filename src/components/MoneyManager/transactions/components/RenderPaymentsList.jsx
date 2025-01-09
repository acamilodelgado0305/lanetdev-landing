import React, { useState, useEffect } from "react";
import { Button, Table, Tag, Space, Typography, Statistic, Card, Spin } from "antd";
import { 
  CheckSquare, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  DollarSign,
  AlertCircle,
  Clock
} from "lucide-react";
import { getPendingTransactions } from "../../../../services/moneymanager/moneyService";
import PaymentDetailsModal from './PaymentDetailsModal';

const { Title, Text } = Typography;

export default function RenderPaymentsList() {
    const [recurrentPayments, setRecurrentPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const fetchTransactions = async () => {
        try {
            const transactions = await getPendingTransactions();
            const recPayments = transactions.filter(tx => tx.recurrent);
            setRecurrentPayments(recPayments);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handlePaymentClick = (payment) => {
        setSelectedPayment(payment);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentModalClose = (shouldRefresh) => {
        setIsPaymentModalOpen(false);
        setSelectedPayment(null);
        if (shouldRefresh) {
            fetchTransactions();
        }
    };

    const filteredPayments = recurrentPayments.filter((payment) => {
        const paymentDate = new Date(payment.date);
        return (
            paymentDate.getMonth() === currentMonth.getMonth() &&
            paymentDate.getFullYear() === currentMonth.getFullYear()
        );
    });

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
    };

    const currentMonthLabel = currentMonth.toLocaleString("es-ES", {
        month: "long",
        year: "numeric",
    });

    const pendingTotal = filteredPayments
        .filter(payment => !payment.estado)
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    const paidTotal = filteredPayments
        .filter(payment => payment.estado)
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    const columns = [
        {
            title: "Descripción",
            dataIndex: "description",
            key: "description",
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                        {record.provider_id}
                    </Text>
                </div>
            )
        },
        {
            title: "Monto",
            dataIndex: "amount",
            key: "amount",
            align: 'right',
            render: (amount) => (
                <Text strong className="text-right">
                    {formatCurrency(amount)}
                </Text>
            ),
        },
        {
            title: "Fecha",
            dataIndex: "date",
            key: "date",
            align: 'center',
            render: (date) => (
                <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDate(date)}</span>
                </div>
            ),
        },
        {
            title: "Estado",
            dataIndex: "estado",
            key: "estado",
            align: 'center',
            render: (estado) => (
                <Tag 
                    icon={estado ? <CheckSquare className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    color={estado ? "success" : "warning"}
                    className="px-3 py-1"
                >
                    {estado ? "Pagado" : "Pendiente"}
                </Tag>
            ),
        },
        {
            title: "Acciones",
            key: "actions",
            align: 'center',
            render: (_, payment) => (
                <Space>
                    {!payment.estado && (
                        <Button 
                            type="primary"
                            onClick={() => handlePaymentClick(payment)}
                            icon={<DollarSign className="w-4 h-4" />}
                            className="flex items-center"
                        >
                            Pagar
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-6">
                    <Title level={4} className="flex items-center gap-2 m-0">
                        <CheckSquare className="w-6 h-6 text-blue-500" />
                        Control de Pagos Recurrentes
                    </Title>
                    <Space size="middle">
                        <Button 
                            icon={<ChevronLeft className="w-4 h-4" />} 
                            onClick={handlePrevMonth}
                        />
                        <Text strong className="text-lg px-4">
                            {currentMonthLabel}
                        </Text>
                        <Button 
                            icon={<ChevronRight className="w-4 h-4" />} 
                            onClick={handleNextMonth}
                        />
                    </Space>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className="bg-blue-50">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-yellow-500" />
                                    Pagos Pendientes
                                </span>
                            }
                            value={filteredPayments.filter(p => !p.estado).length}
                            suffix={`/ ${filteredPayments.length}`}
                        />
                    </Card>
                    <Card className="bg-yellow-50">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                                    Monto Pendiente
                                </span>
                            }
                            value={pendingTotal}
                            formatter={value => formatCurrency(value)}
                        />
                    </Card>
                    <Card className="bg-green-50">
                        <Statistic
                            title={
                                <span className="flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4 text-green-500" />
                                    Monto Pagado
                                </span>
                            }
                            value={paidTotal}
                            formatter={value => formatCurrency(value)}
                        />
                    </Card>
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={filteredPayments}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total: filteredPayments.length,
                    onChange: handlePageChange,
                    showSizeChanger: false,
                }}
                rowKey="id"
                className="border rounded-lg"
                rowClassName={(record) => !record.estado ? 'bg-yellow-50' : ''}
            />

            <PaymentDetailsModal
                isOpen={isPaymentModalOpen}
                onClose={handlePaymentModalClose}
                payment={selectedPayment}
            />
        </div>
    );
}