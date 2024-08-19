This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

#### Prerequisites
* Docker (Docker Desktop is run locally)
* Node.js
* nvm is used for controlling node version
    - You can install it following instructions here https://github.com/nvm-sh/nvm

#### Development
1. Clone the repository
```bash
git clone git@github.com:CDLUC3/dmsp_frontend_prototype.git
cd dmsp_frontend_prototype
npm install
```
2. Build and run the development Docker containers
```bash
docker-compose build
docker-compose up
```
3. Run the following to check that your container is up
```bash
docker container ls -a
```

4. Access the site at http://localhost:3000


#### Production
1. Clone the repository (if not already done in the development steps)
```bash
git clone git@github.com:CDLUC3/dmsp_frontend_prototype.git
cd dmsp_frontend_prototype
```
2. Build and run the production Docker container
```bash
docker build -f Dockerfile.prod -t dmsp_frontend_prototype:dmsp_frontend_prod .

docker run -p 3000:3000 dmsp_frontend_prototype:dmsp_frontend_prod
```
3. Access the Next.js app at http://localhost:3000


## Graphql Queries and Mutations
This app is using graphql-codegen to generate types from graphql queries and mutations. Please place your queries in the `graphql` directory and name the file like `graphql/<name>.<query|mutation>.graphql` per the `codegen.ts` config file.
This will generate the `generated/graphql.tsx` file, and you can use the generated functions or documents to make the graphql requests.

Once the schema has been added, you will need to run `npm run generate` this kicks off a script that builds out Typescript Types for the new schema and queries. The schema is dependent on the graphql server running at `dmsp_backend_prototype` in order to successfully generate.