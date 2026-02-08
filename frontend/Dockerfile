FROM node:24-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm install --force

COPY . .

CMD [ "npm", "run", "dev" ]