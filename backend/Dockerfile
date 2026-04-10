FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npx prisma generate

ENV PORT=3001
EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
