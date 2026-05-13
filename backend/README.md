# Simple Calculator Backend

FastAPI service used by the calculator frontend.

## Endpoints

- `GET /api/health` — health check.
- `POST /api/calculate` — evaluates a safe arithmetic expression.

Example request body:

```json
{
  "expression": "12+8/2"
}
```

Example response:

```json
{
  "expression": "12+8/2",
  "result": "16"
}
```

## Run

Install dependencies inside `/backend`:

```bash
pip install -r requirements.txt
```

Run with Uvicorn from the `backend` directory:

```bash
uvicorn app.main:app --reload
```

Codexirra preview starts the backend with its own host and port settings. The application code does not bind to a fixed host or port.
