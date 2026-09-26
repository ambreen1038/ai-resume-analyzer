import json
import os
from types import SimpleNamespace

import pytest

os.environ.setdefault("GROQ_API_KEY", "test-key")

import main  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

client = TestClient(main.app)

PDF = ("resume.pdf", b"%PDF-1.4 fake", "application/pdf")
TXT = ("resume.txt", b"plain text", "text/plain")

ANALYZE_RESULT = {
    "match_score": 82,
    "ats_score": 74,
    "matched_skills": ["Python", "FastAPI"],
    "missing_skills": ["Kubernetes"],
    "strengths": ["Clear projects"],
    "suggestions": ["Add metrics"],
    "rewrite_suggestions": [{"original": "Worked on APIs", "improved": "Built REST APIs with FastAPI"}],
    "summary": "Good fit.",
}

DETECT_RESULT = {
    "detected_role": "Full-Stack Developer",
    "seniority_level": "Junior",
    "top_skills": ["React", "Node.js", "Python", "FastAPI", "SQL", "Git"],
    "resume_quality_score": 70,
    "years_of_experience": "0-1 years",
    "industries": ["Software"],
    "quick_tips": ["Add metrics", "Shorten summary", "List links"],
    "candidate_summary": "Early-career developer.",
}


def fake_model(content=None, error=None):
    def create(**kwargs):
        if error:
            raise error
        return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=content))])

    return SimpleNamespace(chat=SimpleNamespace(completions=SimpleNamespace(create=create)))


@pytest.fixture
def pdf_text(monkeypatch):
    monkeypatch.setattr(main, "extract_text_from_pdf", lambda _bytes: "Jane Doe. Python developer.")


def post_analyze(files=None):
    return client.post("/analyze", files={"resume": files or PDF}, data={"job_description": "Backend developer"})


def test_root_reports_running():
    res = client.get("/")
    assert res.status_code == 200
    assert "running" in res.json()["message"]


def test_clean_json_response_strips_code_fences():
    assert json.loads(main.clean_json_response('```json\n{"a": 1}\n```')) == {"a": 1}


def test_analyze_rejects_non_pdf():
    res = post_analyze(TXT)
    assert res.status_code == 400
    assert "PDF" in res.json()["detail"]


def test_analyze_requires_job_description():
    res = client.post("/analyze", files={"resume": PDF})
    assert res.status_code == 422


def test_analyze_rejects_pdf_with_no_text(monkeypatch):
    monkeypatch.setattr(main, "extract_text_from_pdf", lambda _bytes: "")
    res = post_analyze()
    assert res.status_code == 400
    assert "extract" in res.json()["detail"]


def test_analyze_returns_model_json(monkeypatch, pdf_text):
    monkeypatch.setattr(main, "client", fake_model("```json\n" + json.dumps(ANALYZE_RESULT) + "\n```"))
    res = post_analyze()
    assert res.status_code == 200
    body = res.json()
    assert body["match_score"] == 82
    assert body["rewrite_suggestions"][0]["improved"].startswith("Built")


def test_analyze_handles_invalid_json(monkeypatch, pdf_text):
    monkeypatch.setattr(main, "client", fake_model("not json at all"))
    res = post_analyze()
    assert res.status_code == 500
    assert "parse" in res.json()["detail"]


def test_analyze_handles_model_failure(monkeypatch, pdf_text):
    monkeypatch.setattr(main, "client", fake_model(error=RuntimeError("rate limited")))
    res = post_analyze()
    assert res.status_code == 500
    assert "AI analysis failed" in res.json()["detail"]


def test_detect_role_rejects_non_pdf():
    res = client.post("/detect-role", files={"resume": TXT})
    assert res.status_code == 400


def test_detect_role_returns_model_json(monkeypatch, pdf_text):
    monkeypatch.setattr(main, "client", fake_model(json.dumps(DETECT_RESULT)))
    res = client.post("/detect-role", files={"resume": PDF})
    assert res.status_code == 200
    body = res.json()
    assert body["detected_role"] == "Full-Stack Developer"
    assert body["seniority_level"] == "Junior"
    assert len(body["top_skills"]) == 6
