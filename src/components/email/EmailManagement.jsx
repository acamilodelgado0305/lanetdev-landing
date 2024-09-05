import React, { useState } from 'react';

// Simulación de correos recibidos de clientes
const initialEmails = [
    { id: 1, subject: "Consulta sobre el producto X", content: "Hola, estoy interesado en el producto X. ¿Me podrías dar más información?" },
    { id: 2, subject: "Disponibilidad de producto Y", content: "¿Tienen disponible el producto Y en stock?" },
    { id: 3, subject: "Solicitud de cotización del producto Z", content: "Me gustaría recibir una cotización del producto Z. Gracias." },
];

// Simulación de usuarios registrados
const registeredUsers = [
    { id: 1, name: "Carlos Pérez", email: "carlos.perez@example.com" },
    { id: 2, name: "Ana Gómez", email: "ana.gomez@example.com" },
    { id: 3, name: "Pedro Martínez", email: "pedro.martinez@example.com" },
];

function EmailManagement() {
    const [emails, setEmails] = useState(initialEmails); // Estado de correos
    const [newEmail, setNewEmail] = useState({ subject: "", content: "", recipients: [], file: null }); // Estado del nuevo correo

    // Maneja el cambio de datos en el formulario de envío de correos
    const handleInputChange = (e) => {
        setNewEmail({ ...newEmail, [e.target.name]: e.target.value });
    };

    // Maneja la selección del archivo adjunto
    const handleFileChange = (e) => {
        setNewEmail({ ...newEmail, file: e.target.files[0] });
    };

    // Envía el correo (simulación)
    const handleSendEmail = () => {
        if (newEmail.subject && newEmail.content && newEmail.recipients.length > 0) {
            alert(`Correo enviado a: ${newEmail.recipients.join(", ")}. Archivo adjunto: ${newEmail.file ? newEmail.file.name : 'Ninguno'}`);
            setNewEmail({ subject: "", content: "", recipients: [], file: null }); // Reinicia el formulario
        } else {
            alert("Por favor completa todos los campos.");
        }
    };

    // Agrega los destinatarios al correo
    const handleRecipientsChange = (e) => {
        const selectedRecipients = Array.from(e.target.selectedOptions, option => option.value);
        setNewEmail({ ...newEmail, recipients: selectedRecipients });
    };

    return (
        <div className="email-management-container p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Administrar Correos</h1>

            {/* Lista de correos recibidos */}
            <div className="email-list mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">Solicitudes de Clientes</h2>
                <ul className="list-none space-y-4">
                    {emails.map(email => (
                        <li key={email.id} className="p-4 bg-white shadow rounded-md">
                            <span className="font-bold block text-lg text-blue-500">{email.subject}</span>
                            <p className="text-gray-700">{email.content}</p>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Formulario para enviar correos */}
            <div className="email-form bg-white p-6 shadow rounded-md">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600">Enviar Correo</h2>
                <div className="mb-4">
                    <label className="block font-bold text-gray-700">Asunto:</label>
                    <input
                        type="text"
                        name="subject"
                        value={newEmail.subject}
                        onChange={handleInputChange}
                        className="border p-2 rounded w-full mt-1"
                        placeholder="Asunto del correo"
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-bold text-gray-700">Contenido:</label>
                    <textarea
                        name="content"
                        value={newEmail.content}
                        onChange={handleInputChange}
                        className="border p-2 rounded w-full mt-1"
                        placeholder="Escribe tu mensaje aquí..."
                    />
                </div>
                <div className="mb-4">
                    <label className="block font-bold text-gray-700">Adjuntar Archivo:</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-gray-700 mt-1"
                    />
                </div>
                <div className="mb-6">
                    <label className="block font-bold text-gray-700">Destinatarios:</label>
                    <select
                        multiple
                        name="recipients"
                        onChange={handleRecipientsChange}
                        className="border p-2 rounded w-full mt-1"
                    >
                        {registeredUsers.map(user => (
                            <option key={user.id} value={user.email}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleSendEmail}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Enviar Correo
                </button>
            </div>
        </div>
    );
}

export default EmailManagement;
