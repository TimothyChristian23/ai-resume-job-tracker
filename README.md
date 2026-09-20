# Matchline

Matchline is a privacy-conscious resume and job matching workspace for thoughtful applications. Upload a resume and job description, compare the skills found in each source, prepare for interviews, tailor resume bullets, and save the application for follow-up.

> This project is designed as a portfolio application. Its match score is a directional comparison of text, not a hiring prediction.

## Product Flow

1. **Upload sources** - Accept PDF, DOCX, and TXT files or paste text directly.
2. **Review extraction** - Keep extracted content editable and show clear loading and failure states.
3. **Analyze the match** - See a transparent score, matched skills, missing skills, and evidence from the resume.
4. **Tailor bullets** - Review editable wording suggestions tied to skills already found in the resume.
5. **Prepare for interviews** - Practice experience, technical, and skill-gap questions grounded in the current sources.
6. **Track the application** - Save role, company, deadline, status, next action, notes, and match score locally.

## Technical Highlights

- Next.js 16 App Router with React and TypeScript
- Client-side PDF extraction with PDF.js
- Client-side DOCX extraction with Mammoth
- Deterministic, explainable skill matching in `src/lib/match.ts`
- Grounded interview prompts in `src/lib/interview.ts`
- Resume bullet suggestions in `src/lib/bullets.ts`
- Browser-local application persistence with hydration-safe loading
- Responsive interface with explicit empty, loading, validation, and error states
- No API keys or external AI provider required for the current demo

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the checks used before pushing changes:

```bash
npm run lint
npm run build
```

## Privacy Notes

- Documents are processed in the browser for the current demo flow.
- The application tracker is stored in browser `localStorage`.
- Raw documents and personal information are not sent to a server by this version.
- Generated suggestions are intentionally framed as drafts and must be reviewed by the user.

## Current Scope and Future Work

The current matching engine uses a curated skill vocabulary and text comparison so the demo is deterministic and inspectable. Future iterations could add authenticated server storage, richer resume parsing, configurable skill taxonomies, application history, and an optional replaceable AI provider with explicit evidence and consent controls.

## Portfolio Summary

Matchline demonstrates full-stack product thinking through document processing, explainable matching, responsive UX, privacy-aware client state, and user-controlled AI-adjacent workflows. The implementation favors clear evidence and editable output over opaque recommendations.
