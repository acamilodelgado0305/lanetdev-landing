import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Spin, ConfigProvider, Modal, Checkbox, Button, Dropdown, Menu } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import esES from 'antd/locale/es_ES';
import { getTransactions } from "../../../services/moneymanager/moneyService";

const FullScreenCalendar = () => {
    const [events, setEvents] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isListVisible, setIsListVisible] = useState(false);

    // Fetch real transactions from API
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

                // Generating the next 12 months for recurring transactions
                for (let i = 0; i < 12; i++) {
                    const nextDate = new Date(currentYear, currentMonth + i, date.getDate());
                    const formattedDate = nextDate.toISOString().split('T')[0];

                    if (!processedEvents[formattedDate]) {
                        processedEvents[formattedDate] = [];
                    }

                    processedEvents[formattedDate].push({
                        type: transaction.type === 'income' ? 'success' : 'error',
                        content: `${transaction.description} - $${transaction.amount}`,
                        paid: transaction.paid // Add paid status
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

    const handleCheckboxClick = (eventContent) => {
        setSelectedEvent(eventContent);
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        setIsModalVisible(false);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const handleToggleList = () => {
        setIsListVisible(!isListVisible);
    };

    const renderMenu = () => {
        const allEvents = Object.keys(events).flatMap(date => events[date].map(event => ({ date, ...event })));

        return (
            <Menu>
                {allEvents.length > 0 ? (
                    allEvents.map((event, index) => (
                        <Menu.Item key={index}>
                            {event.paid ? (
                                <Button type="primary" style={{ backgroundColor: 'green', borderColor: 'green' }}>
                                    {event.content} - Pagado
                                </Button>
                            ) : (
                                <Checkbox onChange={() => handleCheckboxClick(event.content)}>
                                    {event.content} - Pendiente de pago
                                </Checkbox>
                            )}
                        </Menu.Item>
                    ))
                ) : (
                    <Menu.Item key="no-events">No hay eventos</Menu.Item>
                )}
            </Menu>
        );
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <ul className="events" style={{ listStyleType: 'none', padding: 0 }}>
                {listData.map((item, index) => (
                    <li key={index}>
                        {item.paid ? (
                            <Badge status="success" text={item.content} />
                        ) : (
                            <Badge
                                status="error"
                                text={
                                    <>
                                        {item.content} - <span style={{ color: 'red' }}>Pendiente de pago</span>
                                    </>
                                }
                            />
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <ConfigProvider locale={esES}>
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                {loading ? (
                    <Spin size="large" />
                ) : (
                    <>
                        <div className="relative ">
                            <div className="absolute top-3 right-72 z-10 flex items-center space-x-2">
                                <Dropdown overlay={renderMenu()} trigger={['click']}>
                                    <button className="flex items-center border border-gray-200 rounded-md px-3 py-1 cursor-pointer hover:border-blue-500 transition-colors duration-200">
                                        <EllipsisOutlined style={{ fontSize: '24px', cursor: 'pointer' }} />
                                        <span className="ml-2">Pagos</span>
                                    </button>
                                </Dropdown>
                            </div>

                            {/* Calendario */}
                            <Calendar dateCellRender={dateCellRender} />
                        </div>

                        {/* Modal para detalles del pago */}
                        <div>
                            <Modal
                                title="Detalles del Pago"
                                visible={isModalVisible}
                                onOk={handleModalOk}
                                onCancel={handleModalCancel}
                            >
                                <p>{selectedEvent} - Aquí podrías realizar el pago</p>
                            </Modal>
                        </div>
                    </>
                )}
            </div>
        </ConfigProvider>
    );
};

export default FullScreenCalendar;
