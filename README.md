# 🎙️ Chakri — Speak. Get Discovered.

आवाज़ ही रिज़्यूमे है - Your voice is your resume.

Chakri is a voice-first profile builder for blue-collar and industrial workers — electricians, welders, CNC operators, technicians — who are better with their hands than with a keyboard. Instead of filling out a form, a worker just speaks about who they are, and Chakri turns that into a structured, searchable profile.

## The problem

Most hiring platforms assume comfort with typing, resumes, and forms. For a large part of the industrial workforce, that's the real barrier to getting discovered — not lack of skill. Chakri removes the form entirely.

## How it works

1. Speak: the worker taps a mic button. The browser's built-in Web Speech API transcribes speech to text live, right in the browser — no AI involved yet.
2. Extract: once they stop talking, the transcript is sent to a Django backend, which passes it to the Gemini API with a prompt to pull out name, profession, experience, and location.
3. Store: Django saves the structured result as a `WorkerProfile` row in PostgreSQL.
4. Discover: profiles are served back through a REST endpoint and rendered as cards in a "Talent Pool" view, so recruiters browse real people, not resumes.

## Tech stack

Frontend    HTML5, CSS3, vanilla JavaScript (no framework) 
Voice       Browser Web Speech API 
Backend     Django, Django REST Framework 
AI / NLP    Google Gemini API (structured entity extraction) 
Database    PostgreSQL 

## Features

- 🎙️ Live, in-browser speech-to-text - zero network cost until the worker is done talking
- 🤖 LLM-based extraction of name, profession, experience, and location from free-form speech
- 🗂️ Persistent worker profiles backed by PostgreSQL
- 🧑‍🏭 Dual worker/recruiter entry flows on a single, animated landing page
- ⌨️ Manual typing fallback for unsupported browsers

## Running it locally

```bash
# backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows — use `source venv/bin/activate` on Mac/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# frontend
# open frontend/index.html directly, or serve it with any static server
```

Add your own key to `backend/.env` (check `.env.example` for the exact variable name your code expects):

```
GEMINI_API_KEY=your_key_here
```

## API

Method  Endpoint                   Description                                   

POST    `/api/extract-profile/`     Accepts a transcript, returns extracted fields, saves a profile 
GET     `/api/profiles/`            Returns all saved worker profiles              

## Roadmap

- [ ] Recruiter search filtered by role, experience, and location
- [ ] Authentication for recruiter accounts
- [ ] Employer-side marketplace

## Why this project

Built to explore how far voice + LLMs can go as a real accessibility layer for hiring - not a chatbot gimmick, but a genuine replacement for a form that excludes a large part of the workforce.

---

Built by [Premprakash Sharma](https://www.linkedin.com/in/premprakash-sharma-37998b264)
