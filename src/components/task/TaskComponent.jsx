import React, { useState } from 'react';
import { Typography, Box, List, ListItem, ListItemText, IconButton, Checkbox, TextField, Divider } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

const TaskComponent = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    const handleAddTask = () => {
        if (newTask.trim() !== '') {
            setTasks([
                ...tasks,
                { id: tasks.length + 1, title: newTask, completed: false },
            ]);
            setNewTask(''); // Limpiar el campo de texto
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

    return (
        <Box sx={{ maxWidth: 400, margin: 'auto', p: 4, backgroundColor: 'white', boxShadow: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
                Mis Tareas
            </Typography>

            <Box display="flex" alignItems="center" mb={2}>
                <TextField
                    fullWidth
                    label="Añadir una tarea"
                    variant="outlined"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                />
                <IconButton color="primary" onClick={handleAddTask}>
                    <AddCircleOutlineIcon />
                </IconButton>
            </Box>

            <Divider />

            <List>
                {tasks.map((task) => (
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
                            style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                        />
                    </ListItem>
                ))}
            </List>

            {tasks.length === 0 && (
                <Typography variant="body2" color="textSecondary">
                    No tienes tareas pendientes.
                </Typography>
            )}
        </Box>
    );
};

export default TaskComponent;
