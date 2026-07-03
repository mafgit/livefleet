# 🗺️ LiveFleet - Scalable Real-Time Geospatial Tracking

## 📋 Overview

- 🚀 **Scalable** real-time geospatial driver tracking
- 🐳 **Decoupled & Dockerized** microservice architecture:
    - 🖥️ **Frontend:** Next.js + Zustand + Tailwind
    - ⚙️ **API:** Express + Zod
    - 📡 **Web Socket Ingestion Server:** Socket.io and Redis Adapter
    - 🗄️ **Redis**
    - 🌐 **NGINX**
    - ⌛ **Workers**
    - 🏎️ **Drivers Simulator**

---

<img src="./readme-imgs/1.png" style="border-radius: 8px;"/>

---

- 🗺️ **Leaflet-based** interactive map UI
- 📍 **Redis-backed** geospatial queries
- ⚡ **Dedicated Socket.IO** websocket ingestion server
- 🔌 **Separate Express** API server
- 👑 **Worker** for ping batch ticking with **leader election** coordination
- 📢 **Redis pub/sub and adapter** for synchronization between multiple servers or instances
- 🔢 **Multi-precision geohash** room/subscription strategy
- 📦 **Bounding-box and radius-based** driver queries
- 🚪 **Dynamic room join/leave** for viewport-driven updates
- ⚛️ **Next.js frontend** with Zustand for complex state management
- 🚗 **Driver simulator** for synthetic real-time movement

## 🛠️ Tech Stack

- 🐳 **Docker**
- 💾 **Redis**
- ⏭️ **Next.js**
- 🔌 **Socket.io**
- 🍃 **Leaflet.js**
- 🎛️ **Zustand**
- 🕸️ **Nginx**
- 🗺️ **Ngeohash**
- ✅ **Zod**
- 🚂 **Express**
- 🟢 **Node.js**
- 📘 **TypeScript**
- 🌬️ **Tailwind**

## Tentative

- check about markers not moving / websocket errors in consoles
- got out of region bounds cleanup
- extra padding around bounding box
- add comparison if new bounding box is similar so dont refetch or join/leave rooms
