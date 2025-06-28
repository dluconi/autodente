FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install -g pnpm
RUN pnpm install

# Argumento para a URL da API, com valor padrão
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm run build

EXPOSE 3001

CMD ["pnpm", "run", "preview", "--host", "0.0.0.0", "--port", "3001"]

