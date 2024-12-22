FROM node:18-alpine

WORKDIR /app

# Kopiowanie plików package.json i package-lock.json
COPY package*.json ./

# Uproszczenie instalacji
RUN npm install

# Kopiowanie reszty plików
COPY . .

EXPOSE 3000

# Zmiana na prostszą komendę
CMD ["npm", "run", "dev"]