# Follow Me Live – Real-Time Person-to-Person Tracking on Google Maps

A browser-based prototype that lets one user share their live location and another user **follow them in real time** on Google Maps.  
Both users appear as moving markers, and the route, distance, and ETA update continuously as they travel, similar to ride-hailing apps but built entirely with web technologies and free-tier cloud services. [web:215][web:221]

---

## Features

- 🔵 **Two-way live tracking** – Sharer (red marker) and follower (blue marker) both move dynamically on the same map.
- 🗺️ **Navigation-style view** – Map stays centered on the follower, with an updating blue route line to the sharer.
- ⏱️ **Live distance and ETA** – Google Maps Directions API recomputes route, distance, and ETA whenever either user moves. [web:239]
- ☁️ **Serverless backend** – Uses Firebase Realtime Database for low-latency sync; no custom server required. [web:215]
- 📱 **Works in the browser** – Implemented as a simple web app (HTML, CSS, JavaScript); no native installation.

> Note: The repository does **not** contain real API keys. To run the app, you must provide your own Google Maps and Firebase configuration.

---

## Architecture Overview

- **Sharer (mobile browser)**
  - Opens `sharer.html`.
  - Grants location permission; app uses `navigator.geolocation.watchPosition()` to stream GPS coordinates every few seconds.
  - Writes `{ lat, lng, speed, timestamp }` into `liveLocations/{sessionId}` in Firebase Realtime Database. [web:168]

- **Firebase Realtime Database**
  - Central hub that stores the latest location for each `sessionId`.
  - Pushes updates to all connected followers using real-time listeners (WebSockets under the hood). [web:215]

- **Follower (mobile browser)**
  - Opens `index.html`, enters the session ID, and listens to `liveLocations/{sessionId}`.
  - Tracks its own position via Geolocation API (blue marker) and renders the sharer’s position (red marker).
  - Calls Google Maps Directions API to draw the blue path and compute distance + ETA between the two positions. [web:239]

---

## Getting Started

1. **Clone the repository**

git clone https://github.com/your-username/Follow-Me-Live-A-Real-Time-Person-to-Person-Tracking-Prototype-on-Google-Maps.git
cd Follow-Me-Live-A-Real-Time-Person-to-Person-Tracking-Prototype-on-Google-Maps


2. **Create Firebase project**

- Create a Firebase project and Realtime Database.
- Copy your Firebase config and update it in `sharer.js` and `tracker.js`. [web:215]

3. **Create Google Maps API key**

- In Google Cloud Console, enable:
  - Maps JavaScript API
  - Directions API
- Create a restricted API key (HTTP referrers and these APIs only).
- In `index.html`, replace `YOUR_MAPS_API_KEY` in the script URL with your key.

4. **Run locally**

- Open `index.html` and `sharer.html` in a local web server (e.g., VS Code Live Server) or deploy to Firebase Hosting.

---

## How to Use

1. On phone A (Sharer):
- Open `sharer.html`.
- Allow location access.
- Share the generated `session_xxxxx` ID with the follower.

2. On phone B (Follower):
- Open `index.html`.
- Paste the session ID and click **Track**.
- Watch both markers move, along with the blue route, distance, and ETA.

---

## Future Work

- Native integration as a **“Follow Live Location”** mode directly inside Google Maps.
- Authentication and per-session access control.
- Automatic session expiry and better battery optimizations.
- UI/UX improvements for turn-by-turn style navigation.

---

## Disclaimer

This is a research and educational prototype, not a production-ready application.  
Please keep your own API keys private and restricted, and respect all usage limits and terms of the Google Maps Platform and Firebase services.<img width="2056" height="773" alt="google report" src="https://github.com/user-attachments/assets/563b79ea-cd08-439e-90be-b916377791f2" />

