# The-Form-Server

## start
1. start: `npm run start`
2. docker: `npm run docker:stop && npm run docker:rm && npm run docker:build && npm run docker:run`,

## prisma
1. prisma:push: `npx prisma db push`
2. prisma:migrate:dev: `npx prisma migrate dev --name migrate`
3. prisma:migrate:deploy: `npx prisma migrate deploy`

## docker
1. [Install Docker](https://docs.docker.com/get-docker/) on your machine
2. docker:stop: `docker stop the-form-server || true`
3. docker:rm: `docker rm the-form-server || true`
4. docker:build: `docker build -t the-form-server .`
5. docker:run: `docker run --name the-form-server --env-file .env.production -dp 127.0.0.1:8081:8081 the-form-server`