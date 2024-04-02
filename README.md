This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Installation

#### Prerequisites
- Docker
- Node.js

#### Development
1. Clone the repository
```bash
git clone git@github.com:CDLUC3/dmsp_frontend_prototype.git
cd dmsp_frontend_prototype
```
2. Build and run the development Docker container
```bash
docker build -f Dockerfile.dev -t dmsp_frontend_prototype:dmsp_frontend_dev .

docker run -p 3000:3000 dmsp_frontend_prototype:dmsp_frontend_dev
```
3. Run the following to check that your container is up
```bash
docker container ls -a
```

4. Access the site at http://localhost:3000
You can view the landing page by going directly to http://localhost:3000/dmps/10.48321/D1SP4H


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



