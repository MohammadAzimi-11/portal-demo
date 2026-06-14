# Portal Frontend Admin Panel Demo

This repository is prepared as a public online demo of the Portal admin panel.
The hosted demo is for UI and workflow preview only. It runs with local mock
data in the browser so visitors can open the app without a live backend server.

## Demo Notice

- This online version is only for demonstration and presentation.
- The production system has a backend and a database.
- The backend is built with Prisma ORM.
- The project does not depend on handwritten SQL files for the demo setup.
- Demo data is stored in the browser through `localStorage` and is not real data.
- Create, update, delete, filters, lists, and dashboard-like flows are simulated
  so the interface can be reviewed online.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts
- Prisma-backed backend in the full application

## Local Demo Mode

The frontend uses `src/utils/demoApi.js` when `VITE_API_URL` is not set. This
prevents network errors on static hosting platforms such as GitHub Pages,
Netlify, or Vercel static deployments.

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

The generated static files are placed in `dist/`.

## Connect To A Real Backend

When the real backend is available, create an `.env` file and set:

```env
VITE_API_URL=https://your-api.example.com
VITE_USE_MOCK_API=false
```

Leave these values unset for the public demo build.

## GitHub Deployment Notes

This app uses hash routing, so static hosting can refresh internal pages without
server-side rewrite rules.

For GitHub Pages or any static host, deploy the output of:

```bash
npm run build
```

## Important

This repository is intended to show the frontend experience. The full system
includes backend APIs, database models, and Prisma-based data access that are
not required for the public demo preview.
