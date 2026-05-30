FROM node:20-alpine

WORKDIR /the-aussie-outfit-authentican-service

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5002

CMD ["npm", "start"]