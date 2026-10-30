# RoutVia

**Adaptive Smart Mobile App for Tracking and Monitoring of Public Transport**

RoutVia is a passenger-facing Karachi Red Bus tracker with live Firebase location sharing, approximate ETAs, route browsing, Lost & Found reports, a rule-based assistant, and a driver GPS panel.

## Features

- Karachi Red Bus routes R9, R4, and R2 with stop-aware trip filtering
- Firebase Realtime Database live bus locations on the Spark plan
- Clearly labelled Demo Mode when Firebase is not configured
- Leaflet and OpenStreetMap live tracking map
- Approximate ETAs using straight-line distance and configurable speed settings
- Driver GPS publishing with throttling, offline handling, on-disconnect cleanup, and wake lock support
- Lost & Found reports with Firebase realtime updates or device-only fallback
- RoutVia AI Assistant using real active bus data and route information
- Responsive passenger-first layout for phones, tablets, and laptops

## Stack

React, Vite, React Router, Leaflet, React Leaflet, Lucide icons, Firebase Realtime Database, and OpenStreetMap tiles. No paid services are required.

## Install

```bash
npm install
```

## Environment

Copy `.env.example` to `.env` or use the included `.env`, then replace each `YOUR_...` Firebase placeholder with the Web App configuration from Firebase Console. The file is ignored by git. With placeholder values, RoutVia automatically uses Demo Mode.

Important settings include `VITE_DEMO_MODE` (`auto`, `on`, or `off`), ETA speed and road-distance settings, stale data timeout, and GPS write interval.

## Firebase Spark setup

1. Create a Firebase project on the free Spark plan.
2. Create a Realtime Database in locked mode.
3. Enable Authentication > Sign-in method > Anonymous.
4. Register a Web App and copy its configuration into `.env`.
5. Paste `database.rules.json` into Realtime Database > Rules and publish it.
6. Optionally import `docs/routes-seed.json` into the `routes/` node. Clients only read routes; they never write them.

The rules require authenticated clients, validate every bus and Lost & Found field, and make Lost & Found reports create-only. Never place service-account credentials in this project.

## Run locally

```bash
npm run dev
```

The app opens at `http://localhost:5173`.

## Ngrok driver testing

Phone GPS requires HTTPS.

1. Configure your ngrok token once with `ngrok config add-authtoken YOUR_NGROK_TOKEN`.
2. Start the app with `npm run dev`.
3. In another terminal run `npm run tunnel`.
4. Open the printed HTTPS address on the driver phone at `/driver`.
5. Open the same address on the passenger laptop at `/`.

The ngrok address changes after each restart, and the laptop, development server, and tunnel must remain on. If Vite blocks the host, add the exact host to `VITE_ALLOWED_HOST` and restart the app.

## Demo Mode

Demo Mode works without Firebase keys. It simulates R9 and R4 movement along their full route polylines and labels every simulated location and estimate. It never presents simulated data as driver GPS.

## Test checklist

- No Firebase keys: Home, map, assistant, driver GPS, and Lost & Found device storage work without a crash.
- Firebase configured: Anonymous Auth succeeds and live bus updates appear.
- Driver: Start Trip, allow GPS, verify `buses/BUS001`, then Stop Trip and verify `inactive`.
- Passenger: open tracking, select stops, use map controls, and confirm approximate ETA updates.
- Lost & Found: submit a valid report and confirm it appears in `lostFound/`.
- Use `?debug=1` on Tracking or Driver for diagnostics.

## Troubleshooting

- **Blocked request / host not allowed:** add the current ngrok host to `VITE_ALLOWED_HOST` and restart.
- **GPS needs HTTPS:** use the HTTPS ngrok address on the phone.
- **Permission denied:** enable browser location permission for the current address and try Start Trip again.
- **Anonymous sign-in disabled:** enable Anonymous in Firebase Authentication.
- **Permission denied from Database:** publish `database.rules.json` and confirm Anonymous Auth is enabled.
- **Offline:** the driver keeps watching GPS and resumes Firebase writes when the connection returns.

OpenStreetMap tiles are used with attribution and should be used respectfully under the OpenStreetMap tile usage policy. Firebase Spark quotas are shared project limits, so the driver write interval should not be reduced unnecessarily.
