# MF-React-Frontend

Frontend for the MingleFlix project. This project is built using ReactJS, TypeScript, Vite, and TailwindCSS.

## Getting Started

1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm run dev` to start the development server

## How to run component tests

1. Run `npm run test` to start the component tests

## How to run end-to-end tests

1. Make sure all required services are running:

- MF-React-Frontend (Using `npm run dev`)
- MF-Video-Service (Using `npm run dev` or `docker compose up`)
- MF-User-Management-Service (Using `docker compose up`)
- MF-Room-Management-Service (Using `docker compose up`)

2. Run `npm run test-e2e` to start the end-to-end tests or run `npm run test-e2e-gui` to have a graphical user interface

## Docker

Use docker compose to run the project in a container.

```bash
docker compose up -d
```

Visit `http://localhost:3000` to view the project.
