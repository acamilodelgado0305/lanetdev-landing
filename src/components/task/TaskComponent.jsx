import React, { useState } from 'react';
import {
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Checkbox,
    TextField,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Menu,
    MenuItem,
    ListItemIcon,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const TaskComponent = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [taskDetails, setTaskDetails] = useState('');
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElTask, setAnchorElTask] = useState(null);
    const [favoriteTaskId, setFavoriteTaskId] = useState(null);

    const open = Boolean(anchorEl);
    const openTaskMenu = Boolean(anchorElTask);

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
                },
            ]);
            setNewTask('');
            setTaskDetails('');
            setSelectedDate(dayjs()); // Resetear el formulario
        }
    };

    const handleToggleTask = (taskId) => {
        const updatedTasks = tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        setTasks(updatedTasks);
    };

    const handleDeleteTask = (taskId) => {
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);
    };

    const handleFavoriteTask = (taskId) => {
        const updatedTasks = tasks.map((task) =>
            task.id === taskId ? { ...task, favorite: !task.favorite } : task
        );
        setTasks(updatedTasks);
        setFavoriteTaskId(taskId);
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleTaskMenuClick = (event, taskId) => {
        setAnchorElTask({ taskId, anchor: event.currentTarget });
    };

    const handleTaskMenuClose = () => {
        setAnchorElTask(null);
    };

    // Separar tareas completadas y pendientes
    const completedTasks = tasks.filter((task) => task.completed);
    const pendingTasks = tasks.filter((task) => !task.completed);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ maxWidth: 400, margin: 'auto', p: 4, backgroundColor: 'white', boxShadow: 3, borderRadius: 2 }}>
                {/* Menú desplegable de opciones generales */}
                <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" gutterBottom>
                        Pagos Pendientes
                    </Typography>
                    <IconButton
                        aria-label="more"
                        aria-controls="long-menu"
                        aria-haspopup="true"
                        onClick={handleMenuClick}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        PaperProps={{
                            style: {
                                maxHeight: 200,
                                width: '20ch',
                            },
                        }}
                    >
                        <MenuItem onClick={handleMenuClose}>Mis Pagos</MenuItem>
                        <MenuItem onClick={handleMenuClose}>Nueva lista</MenuItem>
                    </Menu>
                </Box>

                {/* Accordion para añadir nueva tarea */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <IconButton color="primary">
                            <AddCircleOutlineIcon />
                        </IconButton>
                        <Typography sx={{ marginLeft: 1, color: 'blue' }}>Añadir un Pago</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box display="flex" alignItems="center" mb={2}>
                            <TextField
                                fullWidth
                                label="Título"
                                variant="outlined"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                            />
                        </Box>

                        <Box display="flex" alignItems="center" mb={2}>
                            <InfoIcon color="action" sx={{ marginRight: 2 }} />
                            <TextField
                                fullWidth
                                label="Detalles"
                                variant="outlined"
                                value={taskDetails}
                                onChange={(e) => setTaskDetails(e.target.value)}
                            />
                        </Box>

                        <Box display="flex" alignItems="center" mb={2}>
                            <EventIcon color="action" sx={{ marginRight: 2 }} />
                            <MobileDatePicker
                                label="Fecha y hora"
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Box>

                        <IconButton color="primary" onClick={handleAddTask}>
                            <AddCircleOutlineIcon />
                        </IconButton>
                    </AccordionDetails>
                </Accordion>

                <Divider sx={{ my: 2 }} />

                {/* Lista de tareas pendientes */}
                <Typography variant="h6" gutterBottom>
                    Pagos Pendientes
                </Typography>
                <List>
                    {pendingTasks.map((task) => (
                        <ListItem
                            key={task.id}
                            secondaryAction={
                                <>
                                    <IconButton edge="end" aria-label="favorite" onClick={() => handleFavoriteTask(task.id)}>
                                        {task.favorite ? <StarIcon color="primary" /> : <StarBorderIcon />}
                                    </IconButton>

                                    <IconButton
                                        edge="end"
                                        aria-label="more"
                                        onClick={(event) => handleTaskMenuClick(event, task.id)}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                    {/* Menú desplegable por cada tarea */}
                                    <Menu
                                        anchorEl={anchorElTask?.taskId === task.id ? anchorElTask.anchor : null}
                                        open={anchorElTask?.taskId === task.id}
                                        onClose={handleTaskMenuClose}
                                        PaperProps={{
                                            style: {
                                                maxHeight: 200,
                                                width: '20ch',
                                            },
                                        }}
                                    >
                                        <MenuItem onClick={handleTaskMenuClose}>Mover al principio</MenuItem>
                                        <MenuItem onClick={handleTaskMenuClose}>Añadir un subpago</MenuItem>
                                        <MenuItem onClick={handleTaskMenuClose}>Aplicar sangría</MenuItem>
                                        <MenuItem onClick={() => handleDeleteTask(task.id)}>Eliminar</MenuItem>
                                    </Menu>
                                </>
                            }
                        >
                            <Checkbox
                                checked={task.completed}
                                onChange={() => handleToggleTask(task.id)}
                            />
                            <ListItemText
                                primary={task.title}
                                secondary={task.date ? task.date.format('DD/MM/YYYY') : ''}
                            />
                        </ListItem>
                    ))}
                </List>

                {pendingTasks.length === 0 && (
                    <Typography variant="body2" color="textSecondary">
                        No tienes Pagos pendientes.
                    </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Lista de tareas completadas */}
                <Typography variant="h6" gutterBottom>
                    Pagos Completados
                </Typography>
                <List>
                    {completedTasks.map((task) => (
                        <ListItem
                            key={task.id}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <Checkbox
                                checked={task.completed}
                                onChange={() => handleToggleTask(task.id)}
                            />
                            <ListItemText
                                primary={task.title}
                                secondary={task.date ? task.date.format('DD/MM/YYYY') : ''}
                                style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                            />
                        </ListItem>
                    ))}
                </List>

                {completedTasks.length === 0 && (
                    <Typography variant="body2" color="textSecondary">
                        No tienes Pagos completados.
                    </Typography>
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default TaskComponent;
