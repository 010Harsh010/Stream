# Build Stage
FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_SERVER
ARG VITE_CLIENT_ID

ENV VITE_SERVER=$VITE_SERVER
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID

COPY package*.json ./

RUN npm ci 

COPY . . 

EXPOSE 3000

RUN npm run build

# Production Stage
FROM node:22-alpine
WORKDIR /app

RUN npm install -g serve
ENV PATH="/usr/local/bin:$PATH"
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]

