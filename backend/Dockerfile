FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npx prisma generate

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "npx prisma db push --accept-data-loss || true; node src/index.js"]
