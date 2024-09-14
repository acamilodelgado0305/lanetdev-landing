import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Spin, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import esES from 'antd/locale/es_ES';
import { getTransactions } from "../../../services/moneymanager/moneyService";

const FullScreenCalendar = () => {
    const [events, setEvents] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const transactions = await getTransactions();
            const processedEvents = processRecurringTransactions(transactions);
            setEvents(processedEvents);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setLoading(false);
        }
    };

    const processRecurringTransactions = (transactions) => {
        const processedEvents = {};
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        transactions.forEach(transaction => {
            if (transaction.recurrent) {
                const date = new Date(transaction.date);
                
                // Generacion de los siguientes meses
                for (let i = 0; i < 12; i++) {
                    const nextDate = new Date(currentYear, currentMonth + i, date.getDate());
                    const formattedDate = nextDate.toISOString().split('T')[0];
                    
                    if (!processedEvents[formattedDate]) {
                        processedEvents[formattedDate] = [];
                    }
                    
                    processedEvents[formattedDate].push({
                        type: transaction.type === 'income' ? 'success' : 'error',
                        content: `${transaction.description} - $${transaction.amount}`
                    });
                }
            }
        });

        return processedEvents;
    };

    const getListData = (value) => {
        const date = value.format('YYYY-MM-DD');
        return events[date] || [];
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <ul className="events" style={{ listStyleType: 'none', padding: 0 }}>
                {listData.map((item, index) => (
                    <li key={index} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                    <Calendar dateCellRender={dateCellRender} fullscreen={true} />
                )}
            </div>
        </ConfigProvider>
    );
};

export default FullScreenCalendar;