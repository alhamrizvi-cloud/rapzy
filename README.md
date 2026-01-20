<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/61ebd506-f549-471d-a757-aeb4d0f00e89" />

# RAPZY - Subdomain Enumeration & Live Host Scanning

RAPZY is a **web-based subdomain enumeration and live host scanning platform** designed for reconnaissance and security testing. It combines **passive intelligence sources** with **active probing** to discover subdomains and identify live web services in real time.

> ⚠️ **Disclaimer**: Use RAPZY only on domains you own or have explicit permission to test.


## ✨ Features

* 🔍 Passive subdomain enumeration (certificate transparency, public sources)
* ⚡ Active DNS & HTTP probing
* 🌐 Live host detection (HTTP / HTTPS)
* 🖥️ Modern Web UI (Vite + React + TypeScript)
* 📊 Real-time results display
* ☁️ Backend-ready (API-based architecture)
* 🐳 Fully containerized (Docker & Podman supported)


## 🧱 Tech Stack

**Frontend**

* Vite
* React
* TypeScript
* Tailwind CSS / shadcn-ui

**Backend / Services**

* Supabase (optional)
* REST / WebSocket based scanning engine

**Deployment**

* Docker
* Podman

## 📥 Clone the Repository

```bash
git clone https://github.com/alhamrizvi-cloud/rapzy.git
cd rapzy
```

## 🚀 Running with Docker

### 1️⃣ Build the Docker image

```bash
docker build -t rapzy .
```

### 2️⃣ Run the container

```bash
docker run -d \
  --name rapzy \
  -p 5173:5173 \
  rapzy
```

### 3️⃣ Access the app

Open your browser and visit:

```
http://localhost:5173
```

## 🐧 Running with Podman (Rootless)

> Make sure `podman` is installed and running in rootless mode.

```bash
podman info
```

Podman is fully supported and recommended for Linux users.

### 1️⃣ Build the image

```bash
podman build -t rapzy .
```

### 2️⃣ Run the container

```bash
podman run -d \
  --name rapzy \
  -p 8080:8080 \
  rapzy

```

### 3️⃣ Verify

```bash
podman ps
```


## 🧪 Development (Without Containers)

> Recommended only for development and debugging.

### Requirements

* Node.js 18+
* npm or bun

### Steps

```bash
npm install
npm run dev
```

App will be available at:

```
http://localhost:5173
```

---

```bash
npm install
npm run dev
```

## 🔐 Security Notes

* Rate-limiting is recommended for active scanning
* Avoid scanning large targets from shared IPs
* Always obtain authorization before testing

## 📄 License

MIT License

## 🙌 Credits

Built with ❤️ for security researchers and bug bounty hunters.

If you like this project, ⭐ star the repo and contribute!
