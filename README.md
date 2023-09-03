# The-Form-Server

## Init and start server
1. `npx prisma migrate dev --name init`
2. `npx prisma generate`
3. `node src/index`

## Sync prisma
1. `npx prisma migrate dev --name update`
2. `npx prisma generate`

## Using Docker

1. [Install Docker](https://docs.docker.com/get-docker/) on your machine
2. Build your container: `docker build -t the-form-sever .`
3. Run your container: `docker run -p 8081:8081 --env-file .env.production the-form-sever`

## Refs

1. https://codevoweb.com/api-node-typescript-prisma-postgresql-project-setup/
<br>
[(source code on GitHub)](https://github.com/wpcodevo/node_prisma_postgresql/tree/node_prisma_setup)
2. ...