// Simulación de API para obtener los mensajes de WhatsApp
let conversations = [
    {
        id: 1,
        user: { name: "Carlos Pérez", phoneNumber: "+57 311 123 4567" },
        messages: [
            { text: "Hola, ¿pueden ayudarme con el pedido?", fromUser: true, timestamp: "10:30 AM" },
            { text: "Claro, ¿qué necesitas?", fromUser: false, timestamp: "10:32 AM" },
            { text: "Necesito cambiar la dirección de entrega.", fromUser: true, timestamp: "10:35 AM" }
        ]
    },
    {
        id: 2,
        user: { name: "Ana Gómez", phoneNumber: "+57 312 987 6543" },
        messages: [
            { text: "Hola, ¿cuál es el tiempo de entrega?", fromUser: true, timestamp: "9:45 AM" },
            { text: "En aproximadamente 2 días.", fromUser: false, timestamp: "9:50 AM" }
        ]
    }
];

// Simulación de una demora de API
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para obtener las conversaciones (simulando una API real con retraso)
export const getWhatsAppMessages = async () => {
    try {
        await delay(1000); // Simulación de 1 segundo de latencia
        return conversations;
    } catch (error) {
        console.error("Error al obtener mensajes:", error);
        throw new Error("Error en la API de WhatsApp");
    }
};

// Función para enviar un nuevo mensaje a una conversación
export const sendWhatsAppMessage = async (conversationId, messageText) => {
    try {
        const conversation = conversations.find(conv => conv.id === conversationId);
        if (conversation) {
            const newMessage = {
                text: messageText,
                fromUser: false, // El mensaje es del administrador
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Hora actual
            };
            conversation.messages.push(newMessage);
            return newMessage;
        } else {
            throw new Error('Conversación no encontrada');
        }
    } catch (error) {
        console.error("Error al enviar mensaje:", error);
        throw error; // Devolver el error al frontend para manejarlo si es necesario
    }
};
