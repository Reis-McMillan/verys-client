FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_VERYS_BASE_URL=https://api.verys.mcmlln.dev
ARG VITE_OAUTH2_CLIENT_ID=verys-client

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
