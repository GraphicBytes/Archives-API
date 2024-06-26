FROM node:20.11.1-slim

RUN apt-get update && \
    apt-get install -y nano

WORKDIR /usr/app

COPY /app/package*.json ./

RUN npm install

COPY /app .