import React, { useState, useEffect } from "react";
import { Modal, Button, DatePicker, Tooltip, Row, Col } from "antd";
import { CalendarOutlined, LeftOutlined, RightOutlined, ReloadOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const { RangePicker } = DatePicker;

interface DateNavigatorProps {
    onMonthChange: (dates: [Date, Date]) => void;
    formatCurrency: (value: number) => string;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ onMonthChange, formatCurrency }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [isRangePickerVisible, setIsRangePickerVisible] = useState(false);

    // Estados para los datos de balance
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [monthlyBalance, setMonthlyBalance] = useState(0);
    const [loadingMonthlyData, setLoadingMonthlyData] = useState(false);

    const [currentMonth, setCurrentMonth] = useState(""); // Mes seleccionado

    const quickOptions = [
        { label: "Hoy", value: "today" },
        { label: "Ayer", value: "yesterday" },
        { label: "Últimos 7 días", value: "last7" },
        { label: "Últimos 15 días", value: "last15" },
        { label: "Últimos 30 días", value: "last30" },
        { label: "Esta semana", value: "thisWeek" },
        { label: "Semana pasada", value: "lastWeek" },
        { label: "Este mes", value: "thisMonth" },
        { label: "Mes pasado", value: "lastMonth" },
    ];

    // Función para realizar la petición a la API y obtener los balances
    const fetchMonthlyData = async (monthYear: string) => {
        setLoadingMonthlyData(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || "/api";
            const response = await axios.get(`${API_BASE_URL}/balance/month/${monthYear}`);
            const { total_incomes, total_expenses, net_balance } = response.data;

            // Actualizar los balances con los datos de la API
            setMonthlyIncome(parseFloat(total_incomes) || 0);
            setMonthlyExpenses(parseFloat(total_expenses) || 0);
            setMonthlyBalance(parseFloat(net_balance) || 0);
        } catch (err) {
            console.error("Error fetching monthly data:", err);
        } finally {
            setLoadingMonthlyData(false);
        }
    };

    useEffect(() => {
        if (!currentMonth) {
            const currentMonthFormatted = dayjs().format("YYYY-MM"); // Formato "YYYY-MM" para el mes actual
            setCurrentMonth(currentMonthFormatted); // Establecer el mes actual
        } else {
            fetchMonthlyData(currentMonth); // Llamar a la API con el mes actual
        }
    }, [currentMonth]); // Dependiendo de currentMonth

    const handleQuickSelect = (value: string) => {
        let start: dayjs.Dayjs;
        let end: dayjs.Dayjs = dayjs();

        switch (value) {
            case "today":
                start = dayjs().startOf("day");
                end = dayjs().endOf("day");
                break;
            case "yesterday":
                start = dayjs().subtract(1, "day").startOf("day");
                end = dayjs().subtract(1, "day").endOf("day");
                break;
            case "last7":
                start = dayjs().subtract(7, "day");
                break;
            case "last15":
                start = dayjs().subtract(15, "day");
                break;
            case "last30":
                start = dayjs().subtract(30, "day");
                break;
            case "thisWeek":
                start = dayjs().startOf("week");
                break;
            case "lastWeek":
                start = dayjs().subtract(1, "week").startOf("week");
                end = start.add(6, "day");
                break;
            case "thisMonth":
                start = dayjs().startOf("month");
                break;
            case "lastMonth":
                start = dayjs().subtract(1, "month").startOf("month");
                end = start.endOf("month");
                break;
            default:
                return;
        }

        setRange([start, end]);
        onMonthChange([start.toDate(), end.toDate()]);
        const monthYear = `${start.year()}-${(start.month() + 1).toString().padStart(2, "0")}`;
        setCurrentMonth(monthYear); // Actualizar el mes seleccionado
    };

    const handleMonthChange = (date: dayjs.Dayjs | null) => {
        if (date) {
            const monthYear = `${date.year()}-${(date.month() + 1).toString().padStart(2, "0")}`;
            setCurrentMonth(monthYear); // Actualizar el mes seleccionado
            setRange([date.startOf("month"), date.endOf("month")]);
            onMonthChange([date.startOf("month").toDate(), date.endOf("month").toDate()]);
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const goToPreviousMonth = () => {
        const newMonth = range ? range[0].subtract(1, "month") : dayjs().subtract(1, "month");
        setRange([newMonth.startOf("month"), newMonth.endOf("month")]);
        const monthYear = `${newMonth.year()}-${(newMonth.month() + 1).toString().padStart(2, "0")}`;
        setCurrentMonth(monthYear); // Actualizar el mes seleccionado
        onMonthChange([newMonth.startOf("month").toDate(), newMonth.endOf("month").toDate()]);
    };

    const goToNextMonth = () => {
        const newMonth = range ? range[0].add(1, "month") : dayjs().add(1, "month");
        setRange([newMonth.startOf("month"), newMonth.endOf("month")]);
        const monthYear = `${newMonth.year()}-${(newMonth.month() + 1).toString().padStart(2, "0")}`;
        setCurrentMonth(monthYear); // Actualizar el mes seleccionado
        onMonthChange([newMonth.startOf("month").toDate(), newMonth.endOf("month").toDate()]);
    };

    const currentDisplayMonth = range ? range[0].format("MMMM YYYY") : dayjs().format("MMMM YYYY");

    const handleCustomClick = () => {
        setIsRangePickerVisible(true);
    };

    const handleRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
        if (dates) {
            setRange(dates);
            onMonthChange([dates[0].toDate(), dates[1].toDate()]);
            const monthYear = `${dates[0].year()}-${(dates[0].month() + 1).toString().padStart(2, "0")}`;
            setCurrentMonth(monthYear); // Actualizar el mes seleccionado
        }
        setIsRangePickerVisible(false);
    };

    const handleReset = () => {
        setRange(null);
        const monthYear = `${dayjs().year()}-${(dayjs().month() + 1).toString().padStart(2, "0")}`;
        setCurrentMonth(monthYear); // Actualizar el mes seleccionado
        onMonthChange([dayjs().startOf("month").toDate(), dayjs().endOf("month").toDate()]);
    };

    return (
        <div>


            {/* Controles del calendario */}
            <Row gutter={16} justify="start" align="middle">
                <Col>
                    {/* Mostrar Ingresos, Egresos y Balance */}
                    <div className="mr-3">
                        <div className="flex items-center justify-end">
                            <div className="bg-white px-2 text-center flex-none w-26">
                                <h3 className="text-gray-500 text-[10px] font-medium uppercase">Ingresos</h3>
                                <p className="text-green-600 text-sm font-semibold mt-1 truncate">
                                    {loadingMonthlyData ? "Cargando..." : formatCurrency(monthlyIncome)}
                                </p>
                            </div>
                            <div className="bg-white px-2 text-center flex-none w-26">
                                <h3 className="text-gray-500 text-[10px] font-medium uppercase">Egresos</h3>
                                <p className="text-red-600 text-sm font-semibold mt-1 truncate">
                                    {loadingMonthlyData ? "Cargando..." : formatCurrency(monthlyExpenses)}
                                </p>
                            </div>
                            <div className="px-2 bg-white text-center flex-none w-26">
                                <h3 className="text-gray-500 text-[10px] font-medium uppercase">Balance</h3>
                                <p className="text-blue-600 text-sm font-semibold mt-1 truncate">
                                    {loadingMonthlyData ? "Cargando..." : formatCurrency(monthlyBalance)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col>
                    <Tooltip title="Mes anterior">
                        <Button icon={<LeftOutlined />} onClick={goToPreviousMonth} style={{ width: 40 }} />
                    </Tooltip>
                </Col>
                <Col>
                    <span style={{ fontWeight: "bold", fontSize: "16px" }}>{currentDisplayMonth}</span>
                </Col>
                <Col>
                    <Tooltip title="Mes siguiente">
                        <Button icon={<RightOutlined />} onClick={goToNextMonth} style={{ width: 40 }} />
                    </Tooltip>
                </Col>
                <Col>
                    <Button
                        type="default"
                        icon={<CalendarOutlined />}
                        onClick={showModal}
                        style={{
                            borderColor: "black",
                            color: "black",
                            backgroundColor: "transparent",
                            padding: "5px 10px",
                            fontWeight: "bold",
                        }}
                    >
                        Filtrar por fecha
                    </Button>
                </Col>
                <Col>
                    <Button
                        type="default"
                        icon={<ReloadOutlined />}
                        onClick={handleReset}
                        style={{
                            borderColor: "black",
                            color: "black",
                            backgroundColor: "transparent",
                            padding: "5px 10px",
                            fontWeight: "bold",
                        }}
                    >
                        Restablecer
                    </Button>
                </Col>
            </Row>

            {/* Modal de rango de fecha */}
            <Modal
                title="Seleccionar Rango de Fecha"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={650}
                style={{
                    position: "absolute",
                    right: 40,
                    marginTop: 120,
                    transform: "translate(0, 0)",
                }}
            >
                <div className="flex flex-col gap-2 items-start">
                    <Row gutter={16} justify="space-around" align="middle">
                        <Col>
                            <Tooltip title="Mes anterior">
                                <Button icon={<LeftOutlined />} onClick={goToPreviousMonth} style={{ width: 50 }} />
                            </Tooltip>
                        </Col>
                        <Col>
                            <span style={{ fontWeight: "bold", fontSize: "16px" }}>{currentDisplayMonth}</span>
                        </Col>
                        <Col>
                            <Tooltip title="Mes siguiente">
                                <Button icon={<RightOutlined />} onClick={goToNextMonth} style={{ width: 50 }} />
                            </Tooltip>
                        </Col>
                    </Row>

                    <div style={{ marginTop: '20px' }}>
                        {quickOptions.map((option) => (
                            <Button
                                key={option.value}
                                onClick={() => handleQuickSelect(option.value)}
                                style={{ marginBottom: '10px', marginRight: '10px' }}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <Button
                            key="custom"
                            onClick={handleCustomClick}
                            style={{ marginBottom: '30px', marginRight: '10px', padding: "10px", marginTop: "10px" }}
                        >
                            Personalizado
                        </Button>

                        {isRangePickerVisible && (
                            <RangePicker
                                onChange={(dates) => handleRangeChange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                                format="DD/MM/YYYY"
                                style={{ width: "100%" }}
                                value={range}
                            />
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DateNavigator;
