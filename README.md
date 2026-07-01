# Scalable Real-Time Geospatial Tracking (in progress)

Efficient live updating of hundreds of marker locations over websocket connections

## Overview

<img src="./readme-imgs/1.png" style="border-radius: 8px;"/>

<!-- ## Architecture

Basic → Advanced (in plan)

<img src="./readme-imgs/scalable-real-time-geospatial-tracking.drawio.svg" style="border-radius: 8px;"/> -->

## Tech Stack

- Next.js
- Zustand for complex state management
- Leaflet.js for map
- Tailwind
- Ngeohash region cells
- Redis geospatial queries
- Socket.io rooms
- Zod type checking
- Express
- Node.js
- TypeScript
- Docker

## Issues/Todos

- driver marker expire
- websocket connection error in drivers simulator
- look about ticker or ws-ingestion scaling