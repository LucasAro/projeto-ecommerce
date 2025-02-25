FROM --platform=linux/arm64 python:3.9-slim

WORKDIR /var/task

# Instalar dependências necessárias
RUN apt-get update && \
	apt-get install -y \
	curl \
	unzip \
	nodejs \
	npm \
	&& rm -rf /var/lib/apt/lists/*

# Instalar AWS CLI v2 para ARM
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip" && \
	unzip awscliv2.zip && \
	./aws/install && \
	rm -rf aws awscliv2.zip

# Instalar Serverless Framework e plugins
RUN npm install -g serverless && \
	npm install --save-dev serverless-localstack

# Criar diretório temporário com permissões de escrita
RUN mkdir -p /tmp/serverless && \
	chmod 777 /tmp/serverless

# Configurar AWS
ENV AWS_ACCESS_KEY_ID=test
ENV AWS_SECRET_ACCESS_KEY=test
ENV AWS_DEFAULT_REGION=us-east-1
ENV TMPDIR=/tmp/serverless

# Comando para manter o container rodando
CMD ["tail", "-f", "/dev/null"]