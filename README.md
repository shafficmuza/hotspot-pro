# Uganda ISP Billing + Hotspot/PPPoE Management (Node.js + MySQL + FreeRADIUS)

Deploy-ready starter system:
- AAA: **FreeRADIUS + SQL (MySQL)**
- Backend: **Node.js (Express)**
- Deployment: **Ubuntu VPS** with Docker Compose
- Router support: **Any router/NAS that supports RADIUS** (MikroTik, UniFi, Cisco, Cambium, etc.)

Payments layer:
- Flutterwave Uganda Mobile Money (MTN/Airtel): **implemented**
- MTN MoMo Open API: adapter scaffold + webhook endpoint
- Airtel Money Open API: adapter scaffold + webhook endpoint
- Yo! Payments: adapter scaffold + webhook endpoint
- Xente: adapter scaffold + webhook endpoint
- Pesapal: adapter scaffold + webhook endpoint
- DPO Pay: adapter scaffold + webhook endpoint
- Cellulant Tingg: adapter scaffold + webhook endpoint

> Add credentials in `.env` and set `PAYMENT_PROVIDER` to enable a provider.

---

## Quick start (Ubuntu VPS)

### 1) Install Docker + Compose
```bash
sudo apt update
sudo apt -y install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo   "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu   $(. /etc/os-release && echo "$VERSION_CODENAME") stable" |   sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

### 2) Configure environment
```bash
cp .env.example .env
nano .env
```

### 3) Start
```bash
docker compose up -d --build
```

### 4) Seed admin
```bash
docker compose exec api node ./scripts/seed-admin.js
```

Admin:
- email: `admin@example.com`
- password: `ChangeMeNow!`

### 5) Add routers (NAS) in `freeradius/clients.conf`
```conf
client mikrotik-1 {
  ipaddr = 10.10.0.1
  secret = SuperSharedSecret
  nas_type = mikrotik
}
```
Restart radius:
```bash
docker compose restart radius
```

---

## API
- Health: `GET /health`
- Login: `POST /api/auth/login`
- Plans: `POST /api/plans`, `GET /api/plans`
- Subscribers: `POST /api/subscribers`, `GET /api/subscribers`
- Payments:
  - Initiate payment: `POST /api/payments/initiate`
  - Confirm payment (manual/webhook helper): `POST /api/payments/confirm`
  - List payments: `GET /api/payments`
- Webhooks:
  - `POST /webhooks/flutterwave`
  - `POST /webhooks/mtnmomo`
  - `POST /webhooks/airtelmoney`
  - `POST /webhooks/yopayments`
  - `POST /webhooks/xente`
  - `POST /webhooks/pesapal`
  - `POST /webhooks/dpo`
  - `POST /webhooks/tingg`
