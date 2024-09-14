import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Spin, ConfigProvider, Modal, Checkbox, Button, Dropdown, Menu } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import esES from 'antd/locale/es_ES';

const FullScreenCalendar = () => {
    const [events, setEvents] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isListVisible, setIsListVisible] = useState(false);

    // Simulamos la obtención de datos desde una API
    useEffect(() => {
        setTimeout(() => {
            const fetchedEvents = {
                '2024-09-11': [
                    { type: 'success', content: 'Pago recibo luz', paid: true },
                    { type: 'warning', content: 'Pago a Elvis', paid: false },
                ],
                '2024-09-12': [
                    { type: 'error', content: 'Pago a Camilo', paid: false },
                ],
                '2024-09-14': [
                    { type: 'success', content: 'Pago Arriendo', paid: true },
                ],
            };
            setEvents(fetchedEvents);
            setLoading(false);
        }, 2000);
    }, []);

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
                                    {event.content} - Pendiente de

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
            <ul className="events">
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
                        <div>
                            <div className='absolute ml-[70%] mt-4'>
                                <Dropdown overlay={renderMenu()} trigger={['click']}>
                                    <EllipsisOutlined style={{ fontSize: '24px', cursor: 'pointer', marginBottom: '20px' }} />
                                </Dropdown>

                            </div>
                            <div>
                                <Calendar dateCellRender={dateCellRender}

                                />

                                <Modal
                                    title="Detalles del Pago"
                                    visible={isModalVisible}
                                    onOk={handleModalOk}
                                    onCancel={handleModalCancel}
                                >
                                    <p>{selectedEvent} - Aquí podrías realizar el pago</p>
                                </Modal>
                            </div>


                        </div>

                    </>
                )}
            </div>
        </ConfigProvider>
    );
};

export default FullScreenCalendar;
