# The-Form-Server

## Init
1. `npm run init`
2. `npm run start`

## Sync prisma
1. `npm run update`
2. `npm run start`

## Deploy
1. `npm run deploy`
2. `npm run start`

## Using Docker

1. [Install Docker](https://docs.docker.com/get-docker/) on your machine
2. Build your container: `docker build -t the-form-server .`
3. Run your container: `docker run --env-file .env -dp 127.0.0.1:8081:8081 the-form-server`

You can view your images created with `docker images`
