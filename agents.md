# Antigravity Agent Directives — Project RITAM

## 1. Ground Truth Documents
Always read and strictly adhere to:
- `prd.md`: Product scope, operational loop, and requirements.
- `userflow.md`: Screen definitions, user roles, and execution workflows.
- `implementation.md`: Explicit technical stack, schemas, API routes, and business formulas.

## 2. Hard Architectural Rules
- **No Mocking of Core Logic:** Implement real PostgreSQL + PostGIS queries and real SHA-256 file hashing. Do not leave placeholder stubs like `pass` or `# TODO`.
- **Tenant Isolation:** Ensure non-AUTHORITY users cannot query records outside their `org_id`.
- **Database Migrations:** All schema modifications must be recorded via Alembic migrations under `backend/alembic/versions/`.
- **Test-Driven Delivery:** Every route added must have a corresponding integration test in `backend/tests/`.

## 3. Tool Execution & Permissions
- You have permission to run shell commands to:
  - Create directories and scaffold project files.
  - Run `docker compose up -d` to spin up local PostGIS and MinIO instances.
  - Run `alembic upgrade head` to apply database migrations.
  - Run `pytest` to execute test suites and verify fixes.
- If a terminal command fails, diagnose the error and resolve it before proceeding.