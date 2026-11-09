# Queryline

[![Queryline Banner](/public/queryline.png)](queryline.tier3guy.com)

**Your database, understood.**

Queryline is an AI-powered database workspace that lets you interact with your databases using natural language. Ask questions about your data, explore database schemas, and execute read-only queries without writing SQL manually.

Built with Next.js, TypeScript, LangChain, and OpenRouter.

## Features

- **Natural Language Queries** — Ask questions about your database in plain English.
- **Automatic Schema Introspection** — Retrieve tables, columns, data types, and relationships from the connected database.
- **AI-Powered Query Generation** — Generate database queries based on the actual schema and user intent.
- **Automatic Query Execution** — Execute read-only queries through AI tool calling.
- **Streaming Responses** — Receive AI responses as they are generated.
- **Multiple Database Support** — Work with different database engines from one workspace.
- **Connection Management** — Save, edit, and remove database connections.
- **Conversation History** — Maintain separate conversations associated with database connections.
- **Local-First Storage** — Store saved connections and conversation history in the browser.

## Supported Databases

| Database | Support |
|---|---|
| PostgreSQL | Yes |
| MySQL | Yes |
| MariaDB | Yes |
| MongoDB | Yes |
| SQLite | Yes |
| Microsoft SQL Server | Yes |

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Icons | Hugeicons |
| AI Framework | LangChain |
| AI Provider | OpenRouter |
| Database Drivers | pg, mysql2, mongodb, better-sqlite3, mssql |
| Validation | Zod |
| Storage | Browser localStorage |

## Getting Started

### Prerequisites

- Node.js
- npm
- An OpenRouter API key
- Access to a supported database

### Installation

Clone the repository:

```bash
git clone https://github.com/tier3guy/Queryline

cd queryline
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=your_model_identifier
```

Replace the values with your OpenRouter API key and the model identifier you want to use.

### Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

Queryline uses an AI agent with database tools to understand requests and interact with connected databases.

1. **Connect** — Add a supported database using its connection details.
2. **Inspect** — Queryline retrieves the database schema automatically.
3. **Understand** — The AI agent interprets the user's question using the available schema.
4. **Generate** — The agent generates a database-specific read-only query.
5. **Execute** — The query is executed through the database adapter.
6. **Respond** — Queryline presents the returned data in a readable format.

The agent uses LangChain tool calling to access database schema information and execute queries.

## Architecture

Queryline separates database connectivity, AI orchestration, and workspace functionality.

```text
src/
├── app/
│   ├── api/
│   │   └── ai/
│   │       └── query/
│   └── workspace/
│
├── features/
│   ├── ai/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── tools/
│   │
│   └── workspace/
│       ├── components/
│       ├── hooks/
│       └── types/
│
└── lib/
    ├── ai/
    └── database/
        ├── query-adapters.ts
        ├── query-types.ts
        ├── query-validator.ts
        └── types.ts
```

### Database Adapter Layer

Each supported database is handled through a common adapter interface.

The adapter layer provides:

- Database schema introspection.
- Read-only query execution.
- Database-specific query handling.
- Normalized query results.

This keeps database-specific implementation details separate from the AI agent.

### AI Agent

The LangChain agent has access to two primary tools:

- `get_database_schema` — Retrieves the connected database schema.
- `execute_read_query` — Executes a read-only database query.

The agent uses the selected database type and retrieved schema to generate appropriate queries.

## Security Considerations

Queryline is designed around read-only database access.

- Use dedicated database users with read-only permissions.
- Never expose database credentials in client-side logs or application responses.
- Validate queries before execution.
- Restrict database permissions independently of AI-generated instructions.
- Keep API keys in environment variables.

**Storage note:** Saved database connections and conversation history are currently stored in browser localStorage. Connection credentials are not intended to be stored in a Queryline application database. Browser localStorage is not encrypted, so this approach should be treated as a local-first MVP convenience rather than secure credential storage.

For deployed environments, use HTTPS, enforce a strong Content Security Policy, and consider a more secure credential-storage mechanism.

## Current Scope

Queryline is under active development. Features and implementation details may evolve as the project grows.

## License

Add your preferred license before distributing the project.