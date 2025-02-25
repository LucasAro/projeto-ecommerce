FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expor tanto a porta do React quanto do Storybook
EXPOSE 3000 6006

# Usar um script que inicia tanto o React quanto o Storybook
CMD ["npm", "run", "dev"]
#CMD ["npm", "run", "start"]