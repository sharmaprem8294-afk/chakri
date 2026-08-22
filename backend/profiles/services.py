import json
import re

from google import genai
from django.conf import settings


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


EXTRACTION_PROMPT = """Extract these fields from the transcript below.

Return ONLY valid JSON, no other text, no markdown formatting:

{{
    "name": string or null,
    "profession": string or null,
    "experience_years": string or null,
    "location": string or null,
    "skills": [string]
}}

Transcript:

\"\"\"{transcript}\"\"\"
"""


EMPTY_RESULT = {
    "name": None,
    "profession": None,
    "experience_years": None,
    "location": None,
    "skills": [],
}


def extract_profile_fields(transcript: str) -> dict:

    try:
        prompt = EXTRACTION_PROMPT.format(
            transcript=transcript
        )

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt
        )

        text = (response.text or "").strip()

        # Remove markdown code fences if Gemini returns them.
        text = re.sub(
            r"^```json\s*",
            "",
            text,
            flags=re.IGNORECASE
        )

        text = re.sub(
            r"^```\s*",
            "",
            text
        )

        text = re.sub(
            r"\s*```$",
            "",
            text
        )

        text = text.strip()

        data = json.loads(text)

        return {
            "name": data.get("name"),
            "profession": data.get("profession"),
            "experience_years": data.get("experience_years"),
            "location": data.get("location"),
            "skills": data.get("skills") or [],
        }

    except Exception as error:

        print(
            "[Chakri] Gemini extraction error:",
            error
        )

        return dict(EMPTY_RESULT)