import React, { useState } from 'react';
import { motion } from 'framer-motion'; // Importación de framer-motion para animaciones

// Simulación de correos recibidos de clientes
const initialEmails = [
    { id: 1, subject: "Consulta sobre el producto X", content: "Hola, estoy interesado en el producto X.", userId: 1, read: false },
    { id: 2, subject: "Disponibilidad de producto Y", content: "¿Tienen disponible el producto Y en stock?", userId: 2, read: false },
    { id: 3, subject: "Solicitud de cotización del producto Z", content: "Me gustaría recibir una cotización del producto Z. Gracias.", userId: 3, read: false },
];

// Simulación de usuarios registrados
const registeredUsers = [
    { id: 1, name: "Carlos Pérez", email: "carlos.perez@example.com" },
    { id: 2, name: "Ana Gómez", email: "ana.gomez@example.com" },
    { id: 3, name: "Pedro Martínez", email: "pedro.martinez@example.com" },
];

// Componente para obtener la inicial del nombre como avatar
const UserAvatar = ({ name }) => {
    const initial = name.charAt(0).toUpperCase();
    return (
        <motion.div
            whileHover={{ scale: 1.1 }} // Animación de hover
            className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold"
        >
            {initial}
        </motion.div>
    );
};

function EmailManagement() {
    const [emails, setEmails] = useState(initialEmails); // Estado de correos
    const [newEmail, setNewEmail] = useState({ subject: "", content: "", recipients: [], file: null }); // Estado del nuevo correo
    const [sentEmailsCount, setSentEmailsCount] = useState(0); // Contador de correos enviados
    const [readEmailsCount, setReadEmailsCount] = useState(0); // Contador de correos leídos

    // Maneja el clic en un correo y lo marca como leído
    const handleEmailClick = (emailId) => {
        const updatedEmails = emails.map(email =>
            email.id === emailId && !email.read ? { ...email, read: true } : email
        );
        setEmails(updatedEmails);

        // Actualiza el contador de correos leídos
        const newReadEmailsCount = updatedEmails.filter(email => email.read).length;
        setReadEmailsCount(newReadEmailsCount);
    };

    // Maneja el cambio de datos en el formulario de envío de correos
    const handleInputChange = (e) => {
        setNewEmail({ ...newEmail, [e.target.name]: e.target.value });
    };

    // Maneja la selección del archivo adjunto
    const handleFileChange = (e) => {
        setNewEmail({ ...newEmail, file: e.target.files[0] });
    };

    // Envía el correo (simulación) y actualiza el contador de correos enviados
    const handleSendEmail = () => {
        if (newEmail.subject && newEmail.content && newEmail.recipients.length > 0) {
            alert(`Correo enviado a: ${newEmail.recipients.join(", ")}. Archivo adjunto: ${newEmail.file ? newEmail.file.name : 'Ninguno'}`);
            setNewEmail({ subject: "", content: "", recipients: [], file: null }); // Reinicia el formulario
            setSentEmailsCount(prevCount => prevCount + 1); // Incrementa el contador de correos enviados
        } else {
            alert("Por favor completa todos los campos.");
        }
    };

    // Agrega los destinatarios al correo
    const handleRecipientsChange = (e) => {
        const selectedRecipients = Array.from(e.target.selectedOptions, option => option.value);
        setNewEmail({ ...newEmail, recipients: selectedRecipients });
    };

    // Obtener el nombre de usuario por ID
    const getUserById = (userId) => {
        return registeredUsers.find(user => user.id === userId) || { name: "Usuario Desconocido", email: "" };
    };

    return (
        <motion.div
            className="email-management-container p-6 bg-gray-100 min-h-screen"
            initial={{ opacity: 0 }} // Animación de entrada
            animate={{ opacity: 1 }} // Transición suave
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-4xl font-bold mb-6 text-center text-primary">Administrar Correos</h1>

            {/* Contenedor de dos columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Columna de lista de correos */}
                <motion.div
                    className="email-list"
                    initial={{ x: -200 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-semibold mb-4 text-primary">Solicitudes de Clientes</h2>
                    <ul className="list-none space-y-4">
                        {emails.map(email => {
                            const user = getUserById(email.userId);
                            return (
                                <motion.li
                                    key={email.id}
                                    className={`p-4 bg-white shadow rounded-md flex items-start space-x-4 cursor-pointer ${email.read ? 'opacity-50' : ''}`}
                                    onClick={() => handleEmailClick(email.id)}
                                    whileHover={{ scale: 1.02 }} // Efecto de hover
                                    whileTap={{ scale: 0.98 }}  // Efecto al hacer click
                                >
                                    <UserAvatar name={user.name} />
                                    <div>
                                        <span className="font-bold block text-lg text-primary">{email.subject}</span>
                                        <p className="text-gray-700">{email.content}</p>
                                        <small className="text-gray-500">De: {user.name} ({user.email})</small>
                                    </div>
                                </motion.li>
                            );
                        })}
                    </ul>

                    {/* Contador de correos leídos con animación */}
                    <div className="mt-4 text-gray-700 text-center">
                        <motion.p
                            className="inline-block bg-green-200 text-green-800 px-4 py-2 rounded-full shadow-lg"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            Correos leídos: <span className="font-bold">{readEmailsCount}</span>
                        </motion.p>
                    </div>
                </motion.div>

                {/* Columna de formulario de envío de correos */}
                <motion.div
                    className="email-form bg-white p-6 shadow rounded-md"
                    initial={{ x: 200 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-semibold mb-4 text-primary">Enviar Correo</h2>
                    <div className="mb-4">
                        <label className="block font-bold text-gray-700">Asunto:</label>
                        <input
                            type="text"
                            name="subject"
                            value={newEmail.subject}
                            onChange={handleInputChange}
                            className="border p-2 rounded w-full mt-1 focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Asunto del correo"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block font-bold text-gray-700">Contenido:</label>
                        <textarea
                            name="content"
                            value={newEmail.content}
                            onChange={handleInputChange}
                            className="border p-2 rounded w-full mt-1 focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Escribe tu mensaje aquí..."
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block font-bold text-gray-700">Adjuntar Archivo:</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="block w-full text-gray-700 mt-1 focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block font-bold text-gray-700">Destinatarios:</label>
                        <select
                            multiple
                            name="recipients"
                            onChange={handleRecipientsChange}
                            className="border p-2 rounded w-full mt-1 focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                            {registeredUsers.map(user => (
                                <option key={user.id} value={user.email}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>
                    <motion.button
                        onClick={handleSendEmail}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all focus:ring-4 focus:ring-blue-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Enviar Correo
                    </motion.button>

                    {/* Contador de correos enviados con animación */}
                    <motion.div
                        className="mt-4 text-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <p className="inline-block bg-blue-200 text-blue-800 px-4 py-2 rounded-full shadow-lg">
                            Correos enviados: <span className="font-bold">{sentEmailsCount}</span>
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default EmailManagement;
