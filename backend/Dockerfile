FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.js index.js weather.js ./
COPY public ./public
EXPOSE 5000
CMD ["node", "index.js"]
