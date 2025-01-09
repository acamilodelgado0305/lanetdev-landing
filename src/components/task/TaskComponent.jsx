import React, { useState } from 'react';
import {
    Typography,
    Card,
    List,
    Checkbox,
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
    CalendarOutlined,
    InfoCircleOutlined,
    MoreOutlined,
    StarOutlined,
    StarFilled,
    CheckCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const TaskComponent = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [taskDetails, setTaskDetails] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [activeKey, setActiveKey] = useState([]);

    // Calcular el progreso de las tareas
    const totalTasks = tasks.length;
    const completedTasksCount = tasks.filter(task => task.completed).length;
    const progressPercentage = totalTasks ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    const handleAddTask = () => {
        if (newTask.trim() !== '') {
            setTasks([
                ...tasks,
                {
                    id: tasks.length + 1,
                    title: newTask,
                    details: taskDetails,
                    completed: false,
                    date: selectedDate,
                    favorite: false,
                    createdAt: dayjs(),
                },
            ]);
            setNewTask('');
            setTaskDetails('');
            setSelectedDate(dayjs());
            message.success('Tarea agregada correctamente');
            setActiveKey([]); // Cerrar el panel después de agregar
        }
    };

    const handleToggleTask = (taskId) => {
        const updatedTasks = tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
        message.success('Estado de la tarea actualizado');
    };

    const handleDeleteTask = (taskId) => {
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);
        message.success('Tarea eliminada correctamente');
    };

    const handleFavoriteTask = (taskId) => {
        const updatedTasks = tasks.map((task) =>
            task.id === taskId ? { ...task, favorite: !task.favorite } : task
        );
        setTasks(updatedTasks);
    };

    const getTaskStatus = (task) => {
        const dueDate = dayjs(task.date);
        if (task.completed) return 'success';
        if (dueDate.isBefore(dayjs(), 'day')) return 'error';
        if (dueDate.isSame(dayjs(), 'day')) return 'warning';
        return 'processing';
    };

    const getTaskMenu = (taskId) => (
        <Menu
            items={[
                {
                    key: '1',
                    label: 'Mover al principio',
                    icon: <ArrowUpOutlined />,
                    onClick: () => message.info('Mover al principio')
                },
                {
                    key: '2',
                    label: 'Añadir una Subtarea',
                    icon: <PlusOutlined />,
                    onClick: () => message.info('Añadir subtarea')
                },
                {
                    type: 'divider'
                },
                {
                    key: '4',
                    label: 'Eliminar',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => handleDeleteTask(taskId)
                },
            ]}
        />
    );

    // Separar tareas
    const completedTasks = tasks.filter((task) => task.completed);
    const pendingTasks = tasks.filter((task) => !task.completed)
        .sort((a, b) => {
            if (a.favorite !== b.favorite) return b.favorite ? 1 : -1;
            return dayjs(a.date).diff(dayjs(b.date));
        });

    return (
        <div className="p-4 bg-gray-50 min-h-[20em]">
            <Card 
                className="max-w-2xl mx-auto shadow-lg"
                bodyStyle={{ padding: '24px' }}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Title level={4} className="mb-1">Mis Tareas</Title>
                        <Text type="secondary">
                            {pendingTasks.length} pendientes, {completedTasks.length} completadas
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
                                <Text strong className="text-blue-500">Nueva Tarea</Text>
                            </Space>
                        }
                        key="1"
                        className="border-none"
                    >
                        <div className="space-y-4 p-4">
                            <Input
                                size="large"
                                placeholder="¿Qué necesitas hacer?"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                prefix={<PlusOutlined className="text-gray-400" />}
                                className="border-2 hover:border-blue-400"
                            />
                            <TextArea
                                placeholder="Agrega más detalles"
                                value={taskDetails}
                                onChange={(e) => setTaskDetails(e.target.value)}
                                className="border-2 hover:border-blue-400"
                                rows={3}
                            />
                            <DatePicker
                                size="large"
                                value={selectedDate}
                                onChange={setSelectedDate}
                                placeholder="Fecha límite"
                                format="DD/MM/YYYY"
                                className="w-full border-2 hover:border-blue-400"
                            />
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={handleAddTask}
                                size="large"
                                className="w-full"
                            >
                                Crear Tarea
                            </Button>
                        </div>
                    </Panel>
                </Collapse>

                <div className="space-y-6">
                    {/* Tareas Pendientes */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <Title level={5} className="mb-0">Pendientes</Title>
                            <Tag color="blue">{pendingTasks.length}</Tag>
                        </div>
                        <List
                            className="bg-white rounded-lg shadow-sm"
                            dataSource={pendingTasks}
                            renderItem={(task) => (
                                <List.Item
                                    className="hover:bg-gray-50 transition-colors"
                                    actions={[
                                        <Button
                                            type="text"
                                            icon={task.favorite ? 
                                                <StarFilled className="text-yellow-400" /> : 
                                                <StarOutlined className="hover:text-yellow-400" />
                                            }
                                            onClick={() => handleFavoriteTask(task.id)}
                                        />,
                                        <Dropdown overlay={getTaskMenu(task.id)} trigger={['click']}>
                                            <Button type="text" icon={<MoreOutlined />} />
                                        </Dropdown>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Checkbox 
                                                checked={task.completed} 
                                                onChange={() => handleToggleTask(task.id)}
                                                className="scale-125"
                                            />
                                        }
                                        title={
                                            <div className="flex items-center gap-2">
                                                <Text>{task.title}</Text>
                                                <Badge 
                                                    status={getTaskStatus(task)} 
                                                    text={dayjs(task.date).format('DD MMM')}
                                                />
                                            </div>
                                        }
                                        description={task.details && 
                                            <Text type="secondary" className="mt-1 block">
                                                {task.details}
                                            </Text>
                                        }
                                    />
                                </List.Item>
                            )}
                            locale={{
                                emptyText: 
                                    <div className="py-8 text-center">
                                        <CheckCircleOutlined style={{ fontSize: '2rem' }} className="text-gray-300 mb-2" />
                                        <Text type="secondary" className="block">¡No hay tareas pendientes!</Text>
                                    </div>
                            }}
                        />
                    </div>

                    {/* Tareas Completadas */}
                    {completedTasks.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <Title level={5} className="mb-0">Completadas</Title>
                                <Tag color="green">{completedTasks.length}</Tag>
                            </div>
                            <List
                                className="bg-white rounded-lg shadow-sm opacity-75"
                                dataSource={completedTasks}
                                renderItem={(task) => (
                                    <List.Item
                                        className="hover:bg-gray-50 transition-colors"
                                        actions={[
                                            <Button
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeleteTask(task.id)}
                                                danger
                                            />
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Checkbox 
                                                    checked={task.completed} 
                                                    onChange={() => handleToggleTask(task.id)}
                                                    className="scale-125"
                                                />
                                            }
                                            title={<Text delete>{task.title}</Text>}
                                            description={
                                                <Space size="small">
                                                    <CheckCircleOutlined className="text-green-700" />
                                                    <Text type="secondary">
                                                        Completada el {dayjs(task.date).format('DD MMM')}
                                                    </Text>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default TaskComponent;