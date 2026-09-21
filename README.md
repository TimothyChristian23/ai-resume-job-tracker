# Matchline

Matchline is a local-first career workspace for comparing a resume against a job description, surfacing fit, and turning that intelligence into concrete next steps. The goal is to help candidates make thoughtful application decisions without handing over their documents to a black-box system.

This project was designed as a portfolio-grade product demo: grounded, explainable, and useful in the real world of job searching. It combines document parsing, skill matching, interview preparation, bullet tailoring, and application tracking in a single workflow.

## Problem

Job searching is often fragmented. Candidates switch between resumes, job postings, notes, spreadsheets, and email threads while trying to answer three questions:

- Does this role match my experience?
- What is the strongest story to tell?
- What should I do next?

Most tools either oversimplify the match or hide the reasoning behind the recommendation. Matchline tries to do the opposite: keep the output explicit, editable, and grounded in the user’s own text.

## What I built

Matchline includes:

- Resume and job text ingestion from PDF, DOCX, and TXT files or pasted text
- Explainable match scoring with shared and missing skills
- Evidence-backed resume highlights tied to the matched skill set
- Interview prep prompts generated from the current resume and role
- Resume bullet suggestions that are anchored in actual text from the candidate’s resume
- A job brief and a downloadable application pack for follow-up
- Local application tracking with saved roles and status updates

## Why this project matters

This is more than a matching demo. It is a product prototype for a real workflow:

- identify fit
- understand gaps
- prepare for conversation
- act on evidence
- keep momentum without losing the original document context

The product favors transparency over magic. Every recommendation is grounded in the provided resume text and the job description. Users can review, edit, copy, and save the generated outputs before acting on them.

## Technical approach

- Next.js App Router with React and TypeScript
- Client-side extraction using PDF.js and Mammoth
- Pure TypeScript business logic for scoring, evidence generation, interview prompts, and bullet suggestions
- Local-first persistence using browser storage
- Hydration-safe rendering to avoid server/client mismatch when restoring saved applications
- Responsive interface designed for a desktop-style product workflow

## Architecture snapshot

- App shell and user flow in src/app/page.tsx
- Skill matching and score logic in src/lib/match.ts
- Interview prompt generation in src/lib/interview.ts
- Bullet suggestion generation in src/lib/bullets.ts
- Job brief and application pack generation in src/lib/job-brief.ts and src/lib/application-pack.ts

## Product flow

1. Upload or paste a resume and a job description.
2. Review the extracted and editable content.
3. Run the analysis to see fit, evidence, and gaps.
4. Tailor bullets around matched skills.
5. Prepare for the conversation with grounded prompts.
6. Save the role and export a brief or application pack.

## Privacy and trust

- Documents are processed in the browser for this version.
- The app does not require an API key to run.
- Generated suggestions are clearly framed as draft material.
- The tracker is stored locally in the browser for a simple, privacy-conscious workflow.

## Getting started

Install dependencies:

npm install

Run the app locally:

npm run dev

Open http://localhost:3000

Run validation checks:

npm run test
npm run lint
npm run build

## Current scope and next opportunities

The current version is intentionally scoped to a local, transparent workflow. Future enhancements could include:

- authenticated multi-user storage
- richer job and resume parsing
- configurable skill taxonomies
- saved history with filters and status dashboards
- optional AI augmentation with clear provenance and consent controls

## Portfolio summary

Matchline demonstrates product thinking across UX, workflow design, explainable AI-adjacent tooling, and privacy-aware local-first engineering. It is structured to show practical judgment: the app does not claim to replace the user’s story, but instead gives them the evidence and structure needed to improve it.

That combination—clear reasoning, user control, and a strong job-search workflow—is the core of the project and the main story I would present to a hiring team.
