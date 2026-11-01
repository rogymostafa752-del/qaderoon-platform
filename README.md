# Qaderoon Platform

Qaderoon (قادرون) is an inclusive accessibility and empowerment platform designed to support people with disabilities through services, healthcare access, communication support, education, navigation, community engagement, and digital inclusion.

## Features included in this MVP
- Responsive bilingual homepage and navigation
- Arabic/English language switcher with RTL/LTR support
- Accessibility controls: text-to-speech, contrast toggle, text size adjustment
- Searchable services directory with category filters
- Health access section with appointment workflow and draft logic
- Emergency profile with privacy-aware support messaging
- AI assistant status handling without exposing secrets
- Platform impact stats from API data
- Mobile-first accessible design

## Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- API layer: REST endpoints for services, impact stats, AI assistant mock status, and appointments

## Run locally
1. Install dependencies:
   npm install
2. Start the app:
   npm run dev
3. Frontend runs on http://localhost:5173
4. Backend runs on http://localhost:5000

## Notes
- AI integration is intentionally not fully connected until a secure external provider and API key are configured.
- Appointment confirmation is never claimed before provider confirmation.
- Location sharing is opt-in and privacy-aware.

## Status
This is a working first-version foundation for Qaderoon, built as a unified accessible platform. It is designed to be extended in future stages with deeper modules, real authentication, secure database storage, maps, and external integrations.
