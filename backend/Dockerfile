FROM node:24-alpine AS development

WORKDIR /src

COPY package*.json ./

COPY . .

RUN npm install --force

RUN npx prisma generate

COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r//' /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD [ "npm", "run", "start:dev" ]

#DEBUG

FROM node:24-alpine AS debug

WORKDIR /src

COPY package*.json ./

COPY . .

RUN npm install --force

RUN npx prisma generate

COPY entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r//' /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD [ "npm", "run", "start:debug" ]

# PRODUCTION

FROM node:24-alpine AS production

WORKDIR /src

COPY package*.json ./

COPY . .

RUN npm install --force

RUN npm run build

CMD [ "npm", "run", "start:prod" ]
