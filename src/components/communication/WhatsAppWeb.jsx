import React, { useState } from 'react';
import Picker from 'emoji-picker-react';

function WhatsAppWeb() {
    // Simulación de todos los usuarios con imágenes de perfil
    const users = [
        { id: 1, name: "Carlos Pérez", phoneNumber: "+57 311 123 4567", imgUrl: "https://res.cloudinary.com/dybws2ubw/image/upload/v1725383238/bmlszzrnu47gqdlimuud.png" },
        { id: 2, name: "Ana Gómez", phoneNumber: "+57 312 987 6543", imgUrl: "https://res.cloudinary.com/dybws2ubw/image/upload/v1725144244/wgu6gwero5cmsm09gx5z.png" },
    ];

    // Imagen por defecto para "Tú"
    const userImg = "https://res.cloudinary.com/dybws2ubw/image/upload/v1725295051/azs8offjpdis1u4lmzyc.jpg";

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
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);  // Controla si el selector de emojis está visible

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

    // Función para obtener la imagen del cliente por su ID
    const getUserImage = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.imgUrl : "";
    };

    // Función para agregar emoji al mensaje
    const onEmojiClick = (emojiObject) => {
        setNewMessage(prevMessage => prevMessage + emojiObject.emoji);
        setShowEmojiPicker(false);  // Cierra el selector de emojis después de seleccionar uno
    };

    // Función para manejar el envío de archivos
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const newMsg = {
                text: `Envío de archivo: ${file.name}`,
                fromUser: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            // Agregar el mensaje de archivo a la conversación activa
            const updatedConversations = conversations.map(convo => {
                if (convo.userId === activeChat.userId) {
                    return {
                        ...convo,
                        messages: [...convo.messages, newMsg]
                    };
                }
                return convo;
            });

            setConversations(updatedConversations);
            setActiveChat({
                ...activeChat,
                messages: [...activeChat.messages, newMsg]
            });
        }
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
                            className="p-3 cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center"
                            onClick={() => handleSelectChat(user.id)}  // Llama a la función cuando haces clic en un usuario
                        >
                            <img
                                src={user.imgUrl}
                                alt={user.name}
                                className="w-12 h-12 rounded-full mr-4"
                            />
                            <div>
                                <strong>{user.name}</strong><br />
                                <small className="text-gray-400">{user.phoneNumber}</small>
                            </div>
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
                                    className={`mb-3 flex items-center ${message.fromUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    {/* Imagen del usuario o cliente */}
                                    {!message.fromUser ? (
                                        <img
                                            src={getUserImage(activeChat.userId)}
                                            alt="Cliente"
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                    ) : (
                                        <img
                                            src={userImg}
                                            alt="Tú"
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                    )}

                                    {/* Mensaje */}
                                    <div className={`p-3 rounded-lg max-w-md ${message.fromUser ? 'bg-primary text-white' : 'bg-gray-300'}`}>
                                        <strong>{message.fromUser ? "Tú" : "Cliente"}:</strong> {message.text}
                                        <br />
                                        <small className="text-xs text-gray-900">{message.timestamp}</small>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Barra de enviar mensaje, emojis y archivos */}
                        <div className="p-4 bg-gray-200 flex items-center space-x-4 fixed bottom-0 w-[65%]">
                            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="px-2">
                                😀
                            </button>
                            {showEmojiPicker && (
                                <div className="absolute bottom-14">
                                    <Picker onEmojiClick={onEmojiClick} />
                                </div>
                            )}
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="fileInput"
                            />
                            <label htmlFor="fileInput" className="cursor-pointer">
                                📎
                            </label>
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
