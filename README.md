# PE Workflow

A simple workflow visualizer using Next.js (App Router), React Flow, and Prisma.

## Setup

1. Copy `.env.example` to `.env` and adjust values if needed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client and run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Docker

You can run the app and PostgreSQL using Docker Compose:

```bash
docker-compose up --build
```

The app will be available at `http://localhost:3000`.
