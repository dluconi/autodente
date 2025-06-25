FROM python:3.9-slim-buster

WORKDIR /app

# Instalar dependências do sistema necessárias para o cryptography
RUN apt-get update && apt-get install -y build-essential libssl-dev libffi-dev gcc

# Copiar e instalar as dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante da aplicação
COPY . .

# Comando de inicialização
CMD ["python", "app.py"]

