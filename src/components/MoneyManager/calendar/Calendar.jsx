import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Spin, ConfigProvider } from 'antd';
import 'antd/dist/reset.css'; // Asegúrate de incluir los estilos de Ant Design
import esES from 'antd/locale/es_ES'; // Importa la localización en español

const FullScreenCalendar = () => {
    const [events, setEvents] = useState({});
    const [loading, setLoading] = useState(true);

    // Simulamos la obtención de datos desde una API
    useEffect(() => {
        setTimeout(() => {
            // Simulación de datos de eventos en español
            const fetchedEvents = {
                '2024-09-11': [
                    { type: 'success', content: 'Reunión de trabajo con el equipo' },
                    { type: 'warning', content: 'Entrega del proyecto final' },
                ],
                '2024-09-12': [
                    { type: 'error', content: 'Cita médica importante' },
                ],
                '2024-09-14': [
                    { type: 'success', content: 'Evento de la empresa: Día de integración' },
                ],
            };
            setEvents(fetchedEvents);
            setLoading(false);
        }, 2000); // Simulamos una espera de 2 segundos
    }, []);

    const getListData = (value) => {
        const date = value.format('YYYY-MM-DD');
        return events[date] || [];
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <ul className="events">
                {listData.map((item, index) => (
                    <li key={index}>
                        <Badge status={item.type} text={item.content} />
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <ConfigProvider locale={esES}>
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {loading ? (
                    <Spin size="large" />
                ) : (
                    <Calendar dateCellRender={dateCellRender} />
                )}
            </div>
        </ConfigProvider>
    );
};

export default FullScreenCalendar;
