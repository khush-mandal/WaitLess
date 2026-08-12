# WaitLess

**Know the crowd. Predict the wait. Choose better.**

WaitLess is a real-time crowd intelligence application. It turns one-tap crowd reports into real-time wait predictions, so people can choose better and businesses see their footfall clearly across hospitality, finance, retail, and entertainment sectors.

This repository contains the full WaitLess prototype implementation, built as a modern Progressive Web App (PWA) with a dedicated backend. 

## Project Structure

This project is structured as a monorepo:

```text
WaitLess/
├── client/          # Vite + React PWA Frontend
│   ├── public/      # Static assets (favicons, manifest icons)
│   ├── src/         # React components, styles, and core logic
│   └── vite.config.js # Vite & PWA plugin configuration
├── server/          # Express.js Backend API
│   ├── app.js       # Main server entry point & routes
│   └── package.json
└── README.md        # Project documentation
```

## Tech Stack

- **Frontend:** React 19, Vite, Vite PWA Plugin, Vanilla CSS (Design System Tokens).
- **Backend:** Node.js, Express.js, CORS.
- **Design System:** 
  - *Typography:* Space Grotesk (Display), Inter (Body), JetBrains Mono (Data/Metrics).
  - *Colors:* Deep Indigo (`#181233`), Violet (`#6C3CE9`), Pulse Cyan (`#12D6C4`).

## Getting Started

To run the full application locally, you will need to start both the backend server and the frontend development server.

### 1. Start the Backend Server

Open a terminal and run the following:

```bash
cd server
npm install
npm run dev
```
*The Express server will start on `http://localhost:5000` with hot-reloading via nodemon.*

### 2. Start the Frontend PWA

Open a second terminal and run:

```bash
cd client
npm install
npm run dev
```
*The Vite React server will start on `http://localhost:5173`. Any API requests made to `/api` from the client are automatically proxied to the backend server running on port 5000.*

## Core Features & Screens

1. **Splash Screen** — Entry point with the WaitLess brand and tagline.
2. **Home** — Search functionality, browse by sector (hospitality, finance, retail, entertainment), and view live nearby previews.
3. **Nearby List** — View places with live crowd badges, estimated wait times, and confidence scores.
4. **Place Details** — Get deep insights on estimated wait ranges, best-time-to-visit, and a smart lower-wait alternative recommendation.
5. **Report Crowd** — One-tap reporting interface to submit live crowd levels (Low / Medium / High), instantly updating the global live data status.

## Core Design Philosophy

Every location, on every screen, must always display **crowd level + estimated wait + confidence** together — never just an estimated wait in isolation. This is the singular rule the whole UI is built around, ensuring users always have context for the wait time prediction.
