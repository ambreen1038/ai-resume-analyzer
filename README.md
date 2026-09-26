# AI Resume Analyzer

[![CI](https://github.com/ambreen1038/ai-resume-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/ambreen1038/ai-resume-analyzer/actions/workflows/ci.yml)

Upload a resume (PDF) and get an AI analysis: a match score against a job description, skill-gap detection, an ATS score and bullet-point rewrite suggestions. A **Quick Scan** mode detects your likely role and seniority without a job description.

**Live demo:** https://ai-resume-analyzer-ecru-gamma.vercel.app

![Landing page](docs/screenshot-landing.jpg)

## Features

- **Resume vs job description:** match score (0-100), ATS score (0-100), matched and missing skills, strengths, suggestions and a short summary.
- **Rewrite suggestions:** weak bullet points from the resume paired with stronger versions.
- **Quick Scan:** no job description needed. Returns the detected role, seniority level and quick tips.
- **PDF parsing:** text is extracted server-side with `pdfplumber`.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, react-dropzone |
| Backend | Python, FastAPI, pdfplumber |
| AI | Llama 3.3 70B (`llama-3.3-70b-versatile`) through the Groq API |
| Hosting | Frontend on Vercel, API on Render |

## How it works

1. The React app uploads the PDF (and job description) to the FastAPI backend.
2. The backend extracts the resume text and sends a structured prompt to the model.
3. The model returns JSON, which the backend cleans and forwards to the frontend.
4. The frontend renders the scores, skills and suggestions.

| Endpoint | Purpose |
|---|---|
| `POST /analyze` | Resume PDF + job description, returns scores, skills, suggestions, rewrites |
| `POST /detect-role` | Resume PDF, returns detected role, seniority level and quick tips |

## Run it locally

You need Python 3.10+, Node 18+ and a free [Groq API key](https://console.groq.com/keys).

**Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # then set GROQ_API_KEY
uvicorn main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The frontend currently calls the hosted API. To use your local backend, change the two request URLs in `frontend/src/pages/Analyzer.jsx` and `QuickScan.jsx` to `http://localhost:8000`.

## Tests

The backend has automated tests (pytest) that cover input validation, the happy paths for both endpoints, code-fenced model output, invalid JSON from the model and model failures. The PDF parser and the Groq client are mocked, so the tests run offline and need no API key.

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

GitHub Actions runs the backend tests and a frontend production build on every push and pull request.

## Limitations

- PDF files only; scanned (image-only) PDFs won't extract text.
- Scores come from a language model, so results can vary between runs and should be read as guidance, not a measurement.
- The hosted API runs on a free tier, so the first request after idle time can take a while to respond.
- No authentication or rate limiting, and CORS is open. Fine for a demo, not for production.
- Uploaded resumes are sent to a third-party model provider (Groq). Don't upload anything you wouldn't share.

## Ideas for next steps

- Move the API URL to an environment variable (`VITE_API_URL`).
- Add rate limiting and stricter CORS.
- Add frontend tests.
