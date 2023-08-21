FROM node:20-alpine AS deps

WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package.json yarn.lock .env.production index.js ./
COPY prisma ./prisma/

RUN yarn

EXPOSE 8081

CMD ["npm", "run", "start:prod"]
