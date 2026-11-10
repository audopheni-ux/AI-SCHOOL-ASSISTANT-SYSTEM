# EDUVIA AI — Real AI Edition

EDUVIA AI is a student learning companion. This edition includes a Node.js/Express backend that securely calls the OpenAI Responses API. The API key is read only from the server environment and must never be placed in browser JavaScript or committed to GitHub.

## Deploy on Render

Create a **Web Service** from this GitHub repository (not a Static Site).
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variable `OPENAI_API_KEY` with your secret key in Render's Environment settings.
- Optional: `OPENAI_MODEL` = `gpt-4.1-mini`

The server serves the frontend and `/api/chat` from the same origin. Health check: `/api/health`.

## Local run

1. Install Node.js 20 or later.
2. Run `npm install`.
3. Set `OPENAI_API_KEY` in your shell environment (do not commit it).
4. Run `npm start`, then open `http://localhost:3000`.

The quiz, notes and timetable features remain browser-local demo features; they are not multi-user cloud storage.
