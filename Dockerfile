#FROM node:20-alpine AS deps
#FROM amd64/node:20-alpine AS deps
FROM --platform=linux/amd64 node:20-alpine AS deps

WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package.json yarn.lock ./
COPY prisma ./prisma/
COPY src ./src/

RUN yarn

EXPOSE 8081

CMD ["npm", "run", "start"]
