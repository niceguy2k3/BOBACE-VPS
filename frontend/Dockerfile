FROM node:24-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install -g npm@10.5.2
RUN rm -rf node_modules package-lock.json
RUN npm install
COPY . .
FROM node:24-slim
WORKDIR /app
RUN npm i -g serve@14
COPY --from=builder /app/dist ./dist
ENV PORT=3000
EXPOSE 3000
CMD sh -c 'serve -s dist -l tcp://0.0.0.0:${PORT:-3000}'
