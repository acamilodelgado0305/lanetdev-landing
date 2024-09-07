import React, { useState } from 'react';

function WhatsAppWeb() {
    // Simulación de todos los usuarios
    const users = [
        { id: 1, name: "Carlos Pérez", phoneNumber: "+57 311 123 4567" },
        { id: 2, name: "Ana Gómez", phoneNumber: "+57 312 987 6543" },
    ];

    // Simulación de conversaciones
    const [conversations, setConversations] = useState([
        {
            userId: 1,
            messages: [
                { text: "Hola, ¿pueden ayudarme con el pedido?", fromUser: true, timestamp: "10:30 AM" },
                { text: "Claro, ¿qué necesitas?", fromUser: false, timestamp: "10:32 AM" },
                { text: "Necesito cambiar la dirección de entrega.", fromUser: true, timestamp: "10:35 AM" }
            ]
        },
        {
            userId: 2,
            messages: [
                { text: "Hola, ¿cuál es el tiempo de entrega?", fromUser: true, timestamp: "9:45 AM" },
                { text: "En aproximadamente 2 días.", fromUser: false, timestamp: "9:50 AM" }
            ]
        }
    ]);

    // Estado para manejar el chat activo y el nuevo mensaje
    const [activeChat, setActiveChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");  // Este es el nuevo mensaje que escribes

    // Función para seleccionar un usuario y mostrar la conversación
    const handleSelectChat = (userId) => {
        const conversation = conversations.find(conv => conv.userId === userId);
        setActiveChat(conversation);
    };

    // Función para manejar el envío del mensaje
    const handleSendMessage = () => {
        if (newMessage.trim() === "") return;  // Si el mensaje está vacío, no hacer nada

        // Crear el nuevo mensaje
        const newMsg = {
            text: newMessage,
            fromUser: true,  // El mensaje es del usuario actual (tú)
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Actualizar la conversación activa
        const updatedConversations = conversations.map(convo => {
            if (convo.userId === activeChat.userId) {
                return {
                    ...convo,
                    messages: [...convo.messages, newMsg]  // Agregar el nuevo mensaje a la conversación
                };
            }
            return convo;
        });

        // Actualizar las conversaciones y la conversación activa
        setConversations(updatedConversations);  // Actualizar el estado con las nuevas conversaciones
        setActiveChat({
            ...activeChat,
            messages: [...activeChat.messages, newMsg]  // Agregar el nuevo mensaje a la conversación activa
        });

        setNewMessage("");  // Limpiar el campo de texto
    };

    return (
        <div className="flex h-screen">
            {/* Columna izquierda: Lista de usuarios */}
            <div className="w-1/4 bg-gray-800 text-white p-6">
                <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">Clientes</h2>
                <ul className="space-y-4">
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className="p-3 cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-lg"
                            onClick={() => handleSelectChat(user.id)}  // Llama a la función cuando haces clic en un usuario
                        >
                            <strong>{user.name}</strong><br />
                            <small className="text-gray-400">{user.phoneNumber}</small>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Columna derecha: Área de mensajes */}
            <div className="flex-1 bg-gray-100 flex flex-col">
                {/* Si hay una conversación activa, muestra los mensajes */}
                {activeChat ? (
                    <>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <h3 className="text-2xl font-bold mb-4">Conversación</h3>
                            {activeChat.messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`mb-3 p-3 rounded-lg max-w-md ${message.fromUser ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 self-start'}`}
                                >
                                    <strong>{message.fromUser ? "Tú" : "Cliente"}:</strong> {message.text}
                                    <br />
                                    <small className="text-xs text-gray-500">{message.timestamp}</small>
                                </div>
                            ))}
                        </div>

                        {/* Input para escribir y enviar mensajes */}
                        <div className="p-4 bg-gray-200 flex items-center space-x-4">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 p-2 border border-gray-300 rounded-lg"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Enviar
                            </button>
                        </div>
                    </>
                ) : (
                    // Si no hay ninguna conversación activa, muestra este mensaje
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Selecciona un usuario para ver los mensajes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WhatsAppWeb;
