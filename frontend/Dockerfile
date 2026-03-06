# Build Stage
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./

RUN npm ci 

COPY . . 

EXPOSE 3000

# ARG VITE_SERVER
# ENV VITE_SERVER=$VITE_SERVER

RUN npm run build

# Production Stage
FROM node:22-alpine
WORKDIR /app

RUN npm install -g serve
ENV Path="/usr/local/bin:$PATH"
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]

