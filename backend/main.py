from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
from groq import Groq
import os
from dotenv import load_dotenv
import json
import io

load_dotenv()

app = FastAPI(title="AI Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text.strip()


def clean_json_response(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines)
    return text.strip()


@app.get("/")
def root():
    return {"message": "AI Resume Analyzer API is running"}


@app.post("/detect-role")
async def detect_role(resume: UploadFile = File(...)):
    if not resume.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    pdf_bytes = await resume.read()
    resume_text = extract_text_from_pdf(pdf_bytes)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

    prompt = f"""
You are an expert career coach and resume analyst.

Analyze this resume and return ONLY a valid JSON with this exact structure:

{{
    "detected_role": "<most fitting job title for this candidate e.g. Full-Stack Developer, Data Scientist>",
    "seniority_level": "<one of: Junior, Mid-Level, Senior, Lead>",
    "top_skills": [<list of exactly 6 strongest technical skills found in resume>],
    "resume_quality_score": <integer 0-100 based on formatting, quantified achievements, action verbs, clarity>,
    "years_of_experience": "<estimated e.g. 0-1 years, 1-2 years, 3-5 years>",
    "industries": [<list of 2-3 industries this candidate suits>],
    "quick_tips": [
        "<specific quick tip to improve resume 1>",
        "<specific quick tip to improve resume 2>",
        "<specific quick tip to improve resume 3>"
    ],
    "candidate_summary": "<2 sentence summary of who this candidate is professionally>"
}}

RESUME:
{resume_text}

Return ONLY valid JSON. No markdown, no extra text.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        raw = response.choices[0].message.content
        cleaned = clean_json_response(raw)
        print("DETECT ROLE RAW:", raw[:300])
        result = json.loads(cleaned)
        return result
    except json.JSONDecodeError as e:
        print("JSON ERROR:", e)
        raise HTTPException(status_code=500, detail="Failed to parse AI response. Please try again.")
    except Exception as e:
        print("FULL ERROR:", str(e))
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not resume.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    pdf_bytes = await resume.read()
    resume_text = extract_text_from_pdf(pdf_bytes)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

    prompt = f"""
You are an expert ATS analyst and career coach.

Analyze the resume against the job description and return ONLY a valid JSON with this exact structure:

{{
    "match_score": <integer 0-100>,
    "ats_score": <integer 0-100>,
    "matched_skills": [<list of skills found in both resume and JD>],
    "missing_skills": [<list of skills in JD but missing from resume>],
    "strengths": [<list of 4-5 candidate strengths>],
    "suggestions": [
        "<actionable suggestion 1>",
        "<actionable suggestion 2>",
        "<actionable suggestion 3>",
        "<actionable suggestion 4>"
    ],
    "rewrite_suggestions": [
        {{
            "original": "<weak bullet point from resume>",
            "improved": "<stronger rewritten version>"
        }},
        {{
            "original": "<another weak bullet point>",
            "improved": "<stronger rewritten version>"
        }}
    ],
    "summary": "<2-3 sentence honest assessment of candidate fit>"
}}

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON. No markdown, no extra text.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        raw = response.choices[0].message.content
        cleaned = clean_json_response(raw)
        print("RAW:", raw[:300])
        result = json.loads(cleaned)
        return result
    except json.JSONDecodeError as e:
        print("JSON ERROR:", e)
        raise HTTPException(status_code=500, detail="Failed to parse AI response. Please try again.")
    except Exception as e:
        print("FULL ERROR:", str(e))
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")
