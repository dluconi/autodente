FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install -g pnpm
RUN pnpm install

# O Vite automaticamente usa o .env da pasta no build
RUN pnpm run build

EXPOSE 3001

CMD ["pnpm", "run", "preview", "--host", "0.0.0.0", "--port", "3001"]
