# FocusFriction

FocusFriction is a student-focused productivity and wellbeing app designed to reduce distraction, make study sessions feel less draining, and support healthier decision-making during demanding coursework.

It combines a calm dashboard, friction-based interruption tools, task decomposition, bedtime routines, and accessible support pathways to help students protect focus without shame or overstimulation.

## What is in this repo?

This repository contains multiple app variants of the same concept:

- `app/` + `components/` — the Next.js web dashboard
- `mobile/` and `focusfriction-mobile/` — React Native / Expo mobile experiences
- `src/` — shared app logic, screens, and state for the mobile implementation

## Core experience

- Dashboard Hub — daily rhythm, energy snapshot, and progress overview
- Friction Locker — short reflective or logic-based pauses before impulsive actions
- Task Deconstructor — breaking large assignments into smaller next steps
- Bedtime Shield — wind-down routines and digital boundaries for recovery
- Human Support — a direct support flow for students who need a gentle reset

## Tech stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Native / Expo for the mobile app

## Getting started

Install dependencies:

```bash
pnpm install
```

Run the web app:

```bash
pnpm dev
```

Then open http://localhost:3000 in your browser.

## Project structure

```text
.
├── app/                  # Next.js app shell and pages
├── components/           # Web UI components
├── mobile/               # Expo mobile app
├── focusfriction-mobile/  # alternate mobile app variant
├── src/                  # shared mobile app code
├── public/               # static assets
├── package.json          # web app dependencies and scripts
├── next.config.mjs       # Next.js config
├── tsconfig.json         # TypeScript config
└── README.md             # project overview
```

## Notes

The repo is structured around a student wellness concept rather than a single framework-specific app. Use the web app for UI exploration and the mobile app folders for the app experiences built for handheld use.
