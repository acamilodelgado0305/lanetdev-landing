import React, { useState } from "react";
import { Modal, Button, DatePicker, Tooltip, Row, Col } from "antd";
import { CalendarOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importa el idioma español

// Configura dayjs para usar español
dayjs.locale("es");

const { RangePicker } = DatePicker;

interface DateNavigatorProps {
    onMonthChange: (dates: [Date, Date]) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ onMonthChange }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [isRangePickerVisible, setIsRangePickerVisible] = useState(false);  // Nuevo estado para controlar la visibilidad del calendario

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

    const handleQuickSelect = (value: string) => {
        let start: dayjs.Dayjs;
        let end: dayjs.Dayjs = dayjs();

        switch (value) {
            case "today":
                start = dayjs().startOf("day"); // 00:00 del día de hoy
                end = dayjs().endOf("day"); // 23:59:59 del día de hoy
                break;
            case "yesterday":
                start = dayjs().subtract(1, "day").startOf("day"); // 00:00 de ayer
                end = dayjs().subtract(1, "day").endOf("day"); // 23:59:59 de ayer
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
    };

    const handleMonthChange = (date: dayjs.Dayjs | null) => {
        if (date) {
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
        onMonthChange([newMonth.startOf("month").toDate(), newMonth.endOf("month").toDate()]);
    };

    const goToNextMonth = () => {
        const newMonth = range ? range[0].add(1, "month") : dayjs().add(1, "month");
        setRange([newMonth.startOf("month"), newMonth.endOf("month")]);
        onMonthChange([newMonth.startOf("month").toDate(), newMonth.endOf("month").toDate()]);
    };

    // Obtener el mes actual para mostrar en el centro en español
    const currentMonth = range ? range[0].format("MMMM YYYY") : dayjs().format("MMMM YYYY");

    // Mostrar el RangePicker cuando se hace clic en "Personalizado"
    const handleCustomClick = () => {
        setIsRangePickerVisible(true);  // Hacer visible el RangePicker inmediatamente
    };

    const handleRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
        if (dates) {
            setRange(dates);
            onMonthChange([dates[0].toDate(), dates[1].toDate()]);
        }
        setIsRangePickerVisible(false);  // Ocultar el RangePicker después de seleccionar las fechas
    };

    return (
        <div>
            <Row gutter={16} justify="start" align="middle">
                <Col>
                    <Tooltip title="Mes anterior">
                        <Button
                            icon={<LeftOutlined />}
                            onClick={goToPreviousMonth}
                            style={{ width: 50 }}
                        />
                    </Tooltip>
                </Col>
                <Col>
                    {/* Mostrar el mes actual en el centro */}
                    <span style={{ fontWeight: "bold", fontSize: "16px" }}>{currentMonth}</span>
                </Col>
                <Col>
                    <Tooltip title="Mes siguiente">
                        <Button
                            icon={<RightOutlined />}
                            onClick={goToNextMonth}
                            style={{ width: 50 }}
                        />
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
            </Row>

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
                    transform: "translate(0, 0)", // Ajusta si lo necesitas
                }}
            >
                <div className="flex flex-col gap-2 items-start">
                    {/* Botones dentro del modal */}
                    <Row gutter={16} justify="space-around" align="middle">
                        <Col>
                            <Tooltip title="Mes anterior">
                                <Button
                                    icon={<LeftOutlined />}
                                    onClick={goToPreviousMonth}
                                    style={{ width: 50 }}
                                />
                            </Tooltip>
                        </Col>
                        <Col>
                            <span style={{ fontWeight: "bold", fontSize: "16px" }}>{currentMonth}</span>
                        </Col>
                        <Col>
                            <Tooltip title="Mes siguiente">
                                <Button
                                    icon={<RightOutlined />}
                                    onClick={goToNextMonth}
                                    style={{ width: 50 }}
                                />
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
                        {/* Mostrar el RangePicker cuando se hace clic en "Personalizado" */}
                        <Button
                            key="custom"
                            onClick={handleCustomClick}  // Mostrar el RangePicker inmediatamente
                            style={{ marginBottom: '30px', marginRight: '10px', padding: "10px", marginTop: "10px" }}
                        >
                            Personalizado
                        </Button>

                        {/* Mostrar el calendario si el estado es visible */}
                        {isRangePickerVisible && (
                            <RangePicker
                                onChange={(dates) => handleRangeChange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                                format="DD/MM/YYYY"
                                style={{ width: "100%" }}
                            />
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DateNavigator;
