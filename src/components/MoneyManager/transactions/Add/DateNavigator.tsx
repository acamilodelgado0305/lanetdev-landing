import React, { useState } from "react";
import { Modal, Button, DatePicker, Tooltip, Row, Col } from "antd";
import { CalendarOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface DateNavigatorProps {
    onMonthChange: (dates: [Date, Date]) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ onMonthChange }) => {
    const [isModalVisible, setIsModalVisible] = useState(false); // Estado para abrir/cerrar el modal
    const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null); // Rango seleccionado

    // Opciones rápidas para la selección de fechas
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
        { label: "Personalizado", value: "custom" },
    ];

    // Manejar la selección rápida de fechas
    const handleQuickSelect = (value: string) => {
        let start: dayjs.Dayjs;
        let end: dayjs.Dayjs = dayjs();

        switch (value) {
            case "today":
                start = dayjs();
                break;
            case "yesterday":
                start = dayjs().subtract(1, "day");
                end = start;
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

        setRange([start, end]); // Establecemos el rango
        onMonthChange([start.toDate(), end.toDate()]); // Llamamos a onMonthChange para pasar el rango al componente principal
    };

    // Cambiar de mes manualmente
    const handleMonthChange = (date: dayjs.Dayjs | null) => {
        if (date) {
            setRange([date.startOf("month"), date.endOf("month")]);
            onMonthChange([date.startOf("month").toDate(), date.endOf("month").toDate()]);
        }
    };

    // Abrir el modal
    const showModal = () => {
        setIsModalVisible(true);
    };

    // Cerrar el modal
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // Navegar entre meses
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

    return (
        <div>
            <Button
                type="default" // Cambia a "default" para que no tenga color de fondo
                icon={<CalendarOutlined />} // Icono de calendario
                onClick={showModal}
                style={{
                    borderColor: 'black', // Borde negro
                    color: 'black', // Texto negro
                    backgroundColor: 'transparent', // Fondo transparente
                    padding: '5px 10px', // Espaciado adecuado
                    fontWeight: 'bold', // Opcional: hacer el texto en negrita
                }}
            >
                Filtrar por fecha
            </Button>

            {/* Modal que contiene el DateNavigator */}
            <Modal
                title="Seleccionar Rango de Fecha"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null} // No queremos botones en el modal por ahora
                width={650}
            >
                <div className="flex flex-col gap-2 items-start">
                    <Row gutter={16} justify="space-around" align="middle">
                        <Col>
                            <Tooltip title="Mes anterior">
                                <Button
                                    icon={<LeftOutlined />}
                                    onClick={goToPreviousMonth}
                                    style={{ width: 50 }} // Ajusta el tamaño de los botones
                                />
                            </Tooltip>
                        </Col>
                        <Col>
                            <Tooltip title="Mes siguiente">
                                <Button
                                    icon={<RightOutlined />}
                                    onClick={goToNextMonth}
                                    style={{ width: 50 }} // Ajusta el tamaño de los botones
                                />
                            </Tooltip>
                        </Col>
                        <Col>
                            <Tooltip title="Mes actual">
                                <Button
                                    icon={<CalendarOutlined />}
                                    onClick={() => setRange([dayjs().startOf("month"), dayjs().endOf("month")])}
                                    style={{ width: 50 }} // Ajusta el tamaño de los botones
                                />
                            </Tooltip>
                        </Col>
                    </Row>

                    {/* Botones de selección rápida */}
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

                    {/* Calendario */}
                    <RangePicker
                        value={range}
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                setRange([dates[0], dates[1]]);
                            } else {
                                setRange(null);
                            }
                        }}
                        format="DD/MM/YYYY"
                        style={{ width: '100%' }}
                        onCalendarChange={(dates, dateStrings) => {
                            if (dates && dates[0] && dates[1]) {
                                onMonthChange([dates[0].toDate(), dates[1].toDate()]);
                            }
                        }}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default DateNavigator;
