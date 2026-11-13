# MediGuard AI — DRisk AI | INNOVASIA 2K26

A React + Vite hackathon demonstration of explainable medication safety intelligence.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

Build a production bundle:

```bash
npm run build
npm run preview
```

## What is included

- Dashboard with illustrative statistics and Recharts visualizations.
- Patient profile form with dynamic medication rows.
- Five deterministic demonstration checks:
  - Drug–drug interaction
  - Drug–disease interaction
  - Drug–allergy conflict
  - Duplicate therapy
  - Dosage threshold example
- Severity-ranked findings with WHAT / WHY / SEVERITY / PROFESSIONAL REVIEW.
- Patient context relationship view.
- Printable report (browser Print → Save as PDF).
- Three fictional demo patient scenarios.
- Guided demo flow.
- Responsive layout.

## Demo scenarios

Use the sidebar or dashboard cards to load:
1. Alex Morgan — warfarin + ibuprofen example.
2. Jamie Rivera — recorded penicillin allergy + amoxicillin example.
3. Taylor Brooks — no matching rules in the small demo knowledge base.

## Important limitations

This is a conceptual hackathon prototype. It uses a small set of illustrative, hard-coded rules and local fictional data. It is not clinically validated, is not a comprehensive medication checker, and must not be used for real medical decisions. A missing alert does not mean a medicine or combination is safe. All findings require independent review by a qualified healthcare professional.

The dosage check is only an example threshold comparison and is not a dosing recommendation or clinical limit. No external LLM or live medical database is integrated. Explanations are stored with the demo rules.

## Project structure

```text
mediguard-ai/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── data.js
    ├── engine.js
    └── styles.css
```

Built by Team DRisk AI · INNOVASIA 2K26
