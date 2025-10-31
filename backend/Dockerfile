FROM node:24-slim
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm@10.5.2
RUN rm -rf node_modules package-lock.json
COPY . .
RUN npm install
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
