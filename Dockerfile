FROM node:20-alpine AS base

WORKDIR /app

# Install root dependencies
COPY package.json ./
RUN npm install

# Install server dependencies + generate Prisma
COPY server/package.json server/
COPY server/prisma server/prisma/
COPY server/.env server/
RUN cd server && npm install && npx prisma generate

# Install client dependencies and build
COPY client/package.json client/
RUN cd client && npm install
COPY client/ client/
RUN cd client && npx vite build

# Copy server code
COPY server/ server/

# Push DB schema (creates SQLite file)
RUN cd server && npx prisma db push

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "server/index.js"]
