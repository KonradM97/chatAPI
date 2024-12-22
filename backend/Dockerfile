FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

VOLUME ["/app/node_modules"]

EXPOSE 4000

CMD ["npm", "run", "dev"] 