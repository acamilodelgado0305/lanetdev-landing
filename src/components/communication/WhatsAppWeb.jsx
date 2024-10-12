import React, { useState } from 'react';
import Picker from 'emoji-picker-react';

function WhatsAppWeb() {
    const users = [
        { id: 1, name: "Carlos Pérez", phoneNumber: "+57 311 123 4567", imgUrl: "https://res.cloudinary.com/dybws2ubw/image/upload/v1725383238/bmlszzrnu47gqdlimuud.png" },
        { id: 2, name: "Ana Gómez", phoneNumber: "+57 312 987 6543", imgUrl: "https://res.cloudinary.com/dybws2ubw/image/upload/v1725144244/wgu6gwero5cmsm09gx5z.png" },
    ];

    const userImg = "https://res.cloudinary.com/dybws2ubw/image/upload/v1725295051/azs8offjpdis1u4lmzyc.jpg";

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

    const [activeChat, setActiveChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const handleSelectChat = (userId) => {
        const conversation = conversations.find(conv => conv.userId === userId);
        setActiveChat(conversation);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() === "") return;

        const newMsg = {
            text: newMessage,
            fromUser: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

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

        setNewMessage("");
    };

    const getUserImage = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.imgUrl : "";
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prevMessage => prevMessage + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const newMsg = {
                text: `Envío de archivo: ${file.name}`,
                fromUser: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

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
        <div className="flex flex-col lg:flex-row h-screen">
            {/* Lista de usuarios */}
            <div className="lg:w-1/4 w-full bg-gray-800 text-white p-6 lg:block shadow-lg">
                <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">Clientes</h2>
                <ul className="space-y-4">
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className="p-3 cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center transition-all ease-in-out duration-200"
                            onClick={() => handleSelectChat(user.id)}
                        >
                            <img
                                src={user.imgUrl}
                                alt={user.name}
                                className="w-12 h-12 rounded-full mr-4 shadow-md"
                            />
                            <div>
                                <strong className="text-lg">{user.name}</strong><br />
                                <small className="text-gray-400">{user.phoneNumber}</small>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Área de mensajes con imagen de fondo */}
            <div className="flex-1 flex flex-col relative bg-cover bg-no-repeat bg-center" style={{ backgroundImage: `url('https://res.cloudinary.com/djbe9agfz/image/upload/v1728696603/4f1b8c54d9d83236153534b3cf71d71c_xvhciu.png')` }}>
                {activeChat ? (
                    <>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <h3 className="text-2xl font-bold mb-4">Conversación</h3>
                            {activeChat.messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`mb-3 flex items-center ${message.fromUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!message.fromUser ? (
                                        <img
                                            src={getUserImage(activeChat.userId)}
                                            alt="Cliente"
                                            className="w-8 h-8 rounded-full mr-2 shadow-sm"
                                        />
                                    ) : (
                                        <img
                                            src={userImg}
                                            alt="Tú"
                                            className="w-8 h-8 rounded-full mr-2 shadow-sm"
                                        />
                                    )}
                                    <div className={`p-3 rounded-lg max-w-md shadow-sm ${message.fromUser ? 'bg-primary text-white' : 'bg-gray-300'}`}>
                                        <strong>{message.fromUser ? "Tú" : "Cliente"}:</strong> {message.text}
                                        <br />
                                        <small className="text-xs text-gray-900">{message.timestamp}</small>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Área de entrada de mensaje */}
                        <div className="p-4 bg-gray-200 flex items-center justify-between fixed bottom-0 w-full lg:w-[75%] shadow-md">
                            <div className="flex items-center space-x-3">
                                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-2xl">
                                    😀
                                </button>
                                {showEmojiPicker && (
                                    <div className="absolute bottom-14">
                                        <Picker onEmojiClick={onEmojiClick} />
                                    </div>
                                )}
                                <label htmlFor="fileInput" className="cursor-pointer text-2xl">
                                    📎
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="fileInput"
                                />
                            </div>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="mt-4 mx-4 flex-1 p-2 border border-gray-300 rounded-lg shadow-sm"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="mt-2 mx-20 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all ease-in-out duration-200"
                            >
                                Enviar
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Selecciona un usuario para ver los mensajes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WhatsAppWeb;
