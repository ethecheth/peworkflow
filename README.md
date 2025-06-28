# PE Workflow

A powerful workflow visualizer using Next.js (App Router), React Flow, and Prisma with PostgreSQL.

## Features

- 🎨 **Custom Node Types**: Config, OracleDb, MariaDb, NAS, Server, ProcedureOracle
- 🖱️ **Drag & Drop**: Intuitive node placement and connection
- 💾 **Save/Load Workflows**: Persistent storage with database
- 🎛️ **Interactive Toolbar**: Easy node creation and workflow management
- 📋 **Properties Sidebar**: Edit node and edge properties
- 🔄 **Real-time Updates**: Live workflow editing and visualization
- 🎯 **Modern UI**: Clean, responsive design with Tailwind CSS

## Setup

1. Copy `env.example` to `.env` and adjust the DATABASE_URL:
   ```bash
   cp env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Docker

You can run the app and PostgreSQL using Docker Compose:

```bash
docker-compose up --build
```

## Usage

1. **Adding Nodes**: Use the toolbar on the left to add different types of nodes
2. **Connecting Nodes**: Drag from a node's handle to another node to create connections
3. **Editing Properties**: Select a node or edge to edit its properties in the sidebar
4. **Saving Workflows**: Enter a workflow name and click "Save Workflow"
5. **Loading Workflows**: Click "Load Workflow" to see and load previously saved workflows

## API Endpoints

- `GET /api/workflows` - Get all workflows
- `POST /api/workflows` - Create a new workflow
- `GET /api/workflows/[id]` - Get a specific workflow
- `PUT /api/workflows/[id]` - Update a workflow
- `DELETE /api/workflows/[id]` - Delete a workflow

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Library**: React Flow, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker support included
