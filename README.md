# The-Form-Server

## Init and start server
1. `npx prisma migrate dev --name init`
2. `prisma generate`
3. `node index`

## Sync prisma
1. `npx prisma migrate dev --name update`
2. `prisma generate`

## Using Docker

1. [Install Docker](https://docs.docker.com/get-docker/) on your machine
2. Build your container: `docker build -t the-form-sever .`
3. Run your container: `docker run -p 8081:8081 --env-file .env.production the-form-sever`
