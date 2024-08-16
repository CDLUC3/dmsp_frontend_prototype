# dmsp_frontend_prototype app
![Next.js](https://img.shields.io/badge/Next.js-v14.2.4-blue)
![Node.js](https://img.shields.io/badge/Node.js-v20.9.0-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the App](#running-the-app)
    - [Building for Production](#building-for-production)
    - [Docker Setup](#docker-setup)
- [Environment variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)

## Introduction
The dmsp_frontend_app is a web application built using NextJS React framework and TypeScript. The app serves up all the pages for the DMP Tool, and uses Apollo GraphQL Client to make requests to the backend server.

The app is a hybrid framework using both frontend and backend logic. The app includes some API endpoints for dealing with authentication - namely for creating an http-only auth cookie, and for checking auth state, and deleting the auth cookie. It also uses middleware to control access to pages based on authentication and roles.

### Graphql Queries and Mutations
This app is using graphql-codegen to generate types from graphql queries and mutations. Please place your queries in the `graphql` directory and name the file like `graphql/<name>.<query|mutation>.graphql` per the `codegen.ts` config file.
This will generate the `generated/graphql.tsx` file, and you can use the generated functions or documents to make the graphql requests.

Once the schema has been added, you will need to run `npm run generate` this kicks off a script that builds out Typescript Types for the new schema and queries. The schema is dependent on the graphql server running at `dmsp_backend_prototype` in order to successfully generate.

This app was bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Features
- **App Router:** Leverages the new App Router for improved routing and page structure.
- **API Routes:** Custom API routes for handling authentication using JWT tokens.
- **Apollo Client:** Uses Apollo Client to make GraphQL requests to the backend
- **SCSS/CSS Modules:** Uses Sass along with CSS Modules for styling.
- **Unit Testing:** Uses Jest with React Testing Library
- **UI Components:** React Aria Components library used with custom components
- **Authentication:** Auth tokens from backend stored in cookie. Token is passed via headers in requests to backend

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v20.9.0 or higher
- [npm](https://www.npmjs.com/) v10.7.0 or higher
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
-- Docker Desktop gives you Docker Engine, Docker CLI client, and Docker Compose

### Installation
1. Clone the repository
```bash
git clone git@github.com:CDLUC3/dmsp_frontend_prototype.git
cd dmsp_frontend_prototype
```
2. Install dependencies
```bash
npm install
```

### Running the App
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm run start
```

### Docker Setup
This project users Docker for both development and production environments. The setup is managed with `docker-compose.yml` files that build off `Dockerfile.dev` for development and `Dockerfile.prod` for production. Additionally, the project includes a `buildspec.yaml` file for AWS CodeBuild, which also references these Dockerfiles.

#### Development
1. Build and run the development Docker containers
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
1. Build and run the production Docker container
```bash
docker build -f Dockerfile.prod -t dmsp_frontend_prototype:dmsp_frontend_prod .

docker run -p 3000:3000 dmsp_frontend_prototype:dmsp_frontend_prod
```
2. Access the Next.js app at http://localhost:3000


## Environment Variables
* `NEXT_PUBLIC_BASE_URL` - "http://localhost:3000"
* `NEXT_PUBLIC_SERVER_ENDPOINT` - Base url for backend server
* `NEXT_PUBLIC_GRAPHQL_SERVER_ENDPOINT` - Graphql server schema endpoint
* `JWT_SECRET` - Secret key for JWT authentication


## Project Structure
```bash
|-- app/
|   |-- api
|       |-- setCookie
|           |-- __tests__
|           |-- route.ts
|   |-- login
|       |-- __tests__
|       |-- login.module.scss
|       |-- page.tsx
|   |-- layout.tsx
|   |-- page.tsx
|   |-- not-found.tsx
|-- components/
|   |-- Header
|       |-- __tests__
|       |-- header.module.scss
|       |-- index.tsx
|   |-- context
|       |-- AuthContext.tsx
|-- generated
|   |-- graphql.tsx
|-- graphql
|   |-- affiliations.query.graphql
|-- lib
|   |-- graphql
|       |-- client
|           |-- apollo-client.ts
|-- public
|   |-- images
|       |-- dmptool_logo_u166.svg
|-- styles
|   |-- globals.scss
|   |-- elements.scss
|-- utils
|   |-- logger.ts
|-- buildspec.yaml
|-- codegen.ts
|-- docker-compose.yml
|-- DockerFile.dev
|-- Dockerfile.prod
|-- middleware.ts
|-- next.config.mjs
|-- package.json
|-- tsconfig.json
```

## API Routes
* `GET /api/check-auth`: returns whether user is authenticated based on presence of auth token in cookie
* `GET /api/get-token`: returns auth token to pass to backend requests
* `POST /api/logout`: logs user out
* `POST /api/setCookie`: sets auth token in http-only cookie


## Contributing
1. Clone the repo from github (`git clone git@github.com:CDLUC3/dmsp_frontend_prototype.git`)
2. Create a new branch prefixing branch with `bug` or `feature` based on type of update (`git checkout -b feature/your-feature`)
3. Add your changes and add commit message (`git add .`; `git commit -m "added new feature`)
    - A pre-commit is run with the `commit` which checks to make sure linting and coverage pass before a commit goes through
4. Push to the branch (`git push --set-upstream origin feature/your-feature`)
5. Open a Pull Request in github

## Contributors
- [Juliet Shin](https://github.com/jupiter007)
- [Brian Riley](https://github.com/briri)
- [Andre Engelbrecht](https://github.com/andrewebdev)
- [Fraser Clark](https://github.com/fraserclark)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) for for details.
