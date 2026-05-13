# Simple Calculator App
# Simple Calculator App

A clean one-page calculator app built with **Codexirra**, using a React, Vite, TypeScript frontend and a FastAPI backend.

This template was generated with [Codexirra](https://codexirra.com), an AI development workspace for building real web applications. Codexirra helps you generate, edit, preview, and refine full web apps from simple prompts.

> Want to build your own app like this?  
> Try Codexirra: [https://codexirra.com](https://codexirra.com)

---

## Built with Codexirra

This project is an example of what can be created using Codexirra.

Codexirra can help generate complete web applications with:

- Frontend pages and components
- Backend API routes
- Clean UI layouts
- Forms, tables, dashboards, and app logic
- Full project structure
- Editable code and live preview

This calculator template is intentionally simple, making it a good starter example for testing a full frontend and backend app structure.

---

## What this app does

- Adds, subtracts, multiplies, divides, and calculates modulo.
- Supports decimal numbers and keyboard input.
- Shows clear loading and error states.
- Keeps the five most recent calculations on the page.
- Uses a real backend endpoint for safe expression evaluation.

## Project structure

```text
/
  src/                 React frontend
  backend/app/main.py  FastAPI backend
```

## Frontend

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

The frontend API client reads `VITE_API_URL` or `VITE_API_BASE_URL` when provided. If neither is configured, it uses same-origin `/api`. The helper always normalizes the base so calls go to `/api/calculate`.

## Backend

Install backend dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Run the API:

```bash
uvicorn app.main:app --reload
```

Available backend routes:

- `GET /api/health`
- `POST /api/calculate`

## Usage

Open the app, tap the calculator buttons, or use your keyboard:

- Number keys enter digits.
- `+`, `-`, `*`, `/`, `%`, and `.` enter operators and decimals.
- `Enter` solves.
- `Backspace` deletes one character.
- `Escape` clears the calculator.
