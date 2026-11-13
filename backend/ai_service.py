
import os
import json
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq

load_dotenv(Path(__file__).resolve().parent / ".env")


def explain_findings(findings):
    if not findings:
        return "No safety findings were provided for explanation."

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is missing from backend/.env")

    client = Groq(api_key=api_key)

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are MediGuard AI's explanation assistant. "
                    "Explain only the supplied medication safety findings "
                    "in clear, simple language. "
                    "Do not invent interactions, medical facts, or sources. "
                    "Do not change risk severity or contradict the findings. "
                    "Do not recommend stopping or changing medication. "
                    "If information is insufficient, say so. "
                    "State that a qualified clinician must review the findings."
                ),
            },
            {
                "role": "user",
                "content": json.dumps(findings),
            },
        ],
        temperature=0.2,
        max_completion_tokens=500,
    )

    return response.choices[0].message.content
