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
- [Authentication](#authentication)
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
- **Accessibility Testing:** Uses jest-axe package
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
npm install
```
2. Install dependencies
```bash
npm install
```

### Environment Variables
For the development environment, the environment variables are stored at `.env.local`. This is set as the default env file in jest.setup.ts.
These variables must be set in order for the app to work.

* `NEXT_PUBLIC_BASE_URL` - Base url for this app (e.g., "http://localhost:3000")
* `NEXT_PUBLIC_SERVER_ENDPOINT` - Base url for backend server (e.g., "http://localhost:4000")
* `NEXT_PUBLIC_GRAPHQL_SERVER_ENDPOINT` - Graphql server schema endpoint (e.g., "http://localhost:4000/graphql")
* `JWT_SECRET` - Secret key for JWT authentication


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

2. To stop the docker container, run 
```bash
docker-compose down
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
|       |-- CsrfContext.tsx
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
|   |-- authHelper.ts
|   |-- authLink.ts
|   |-- errorHandler.ts
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

## Authentication
There are currently two context files, AuthContext.tsx and CsrfContext.tsx, that help manage the auth state and the csrf token state.

All forms submitted to the backend need to include the CSRF token in the header of the request. GraphQL queries have inherent handling of csrf protection as long as we remember to include the CONTENT-TYPE as application/json in the header, which is currently added by the 'utils/authLink' used in the apollo client instance.

Endpoints to refresh the auth tokens and the csrf tokens are called when getting a 401 or 403 error returned from the backend server.

## API Routes
* `GET /api/check-auth`: returns whether user is authenticated based on presence of auth token in cookie

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
