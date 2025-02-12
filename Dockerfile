# Utiliza una imagen de Node.js para construir la aplicación
FROM node:16 as build

# Establece el directorio de trabajo en el contenedor
WORKDIR /main

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Define las variables de entorno que se pasarán durante la construcción
ARG VITE_API_FINANZAS
ARG VITE_API_TERCEROS
ARG VITE_API_AUTH
ARG VITE_API_URL
ARG VITE_API_KEY
ARG VITE_APP_SOCKET_URL

# Configura las variables en el entorno de ejecución (solo en el build)
ENV VITE_API_FINANZAS=$VITE_API_FINANZAS
ENV VITE_API_TERCEROS=$VITE_API_TERCEROS
ENV VITE_API_AUTH=$VITE_API_AUTH
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_APP_SOCKET_URL=$VITE_APP_SOCKET_URL

# Construye la aplicación para producción
RUN npm run build

# Utiliza una imagen de nginx para servir la aplicación
FROM nginx:stable-alpine

# Copia los archivos construidos a la ubicación donde nginx los servirá
COPY --from=build /main/dist /usr/share/nginx/html

# Copia el archivo de configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto en el que nginx está escuchando
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
