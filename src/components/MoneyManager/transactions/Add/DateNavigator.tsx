import React, { useState } from "react";
import { Tooltip, Button, DatePicker, Select } from "antd";
import { CalendarOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { MonthPicker } = DatePicker;

interface DateNavigatorProps {
    onMonthChange: (dates: [Date, Date]) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ onMonthChange }) => {
    const [selectedMonth, setSelectedMonth] = useState(dayjs().startOf("month"));

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

        setSelectedMonth(start);
        onMonthChange([start.toDate(), end.toDate()]);
    };

    // Cambiar de mes manualmente
    const handleMonthChange = (date: dayjs.Dayjs | null) => {
        if (date) {
            setSelectedMonth(date.startOf("month"));
            onMonthChange([date.startOf("month").toDate(), date.endOf("month").toDate()]);
        }
    };

    // Navegar entre meses
    const goToPreviousMonth = () => {
        const newMonth = selectedMonth.subtract(1, "month");
        setSelectedMonth(newMonth);
        onMonthChange([newMonth.startOf("month").toDate(), newMonth.endOf("month").toDate()]);
    };

    const goToNextMonth = () => {
        const newMonth = selectedMonth.add(1, "month");
        setSelectedMonth(newMonth);
        onMonthChange([newMonth.startOf("month").toDate(), newMonth.endOf("month").toDate()]);
    };

    return (
        <div className="flex flex-row gap-2 items-center">
            <Select
                defaultValue="thisMonth"
                onChange={handleQuickSelect}
                options={quickOptions}
                style={{ width: 200 }}
            />
            <MonthPicker
                value={selectedMonth}
                onChange={handleMonthChange}
                format="MMMM YYYY"
                placeholder="Seleccionar mes"
            />
            <Tooltip title="Mes anterior">
                <Button icon={<LeftOutlined />} onClick={goToPreviousMonth} />
            </Tooltip>
            <Tooltip title="Mes siguiente">
                <Button icon={<RightOutlined />} onClick={goToNextMonth} />
            </Tooltip>
            <Tooltip title="Mes actual">
                <Button icon={<CalendarOutlined />} onClick={() => handleQuickSelect("thisMonth")} />
            </Tooltip>
        </div>
    );
};

export default DateNavigator;
