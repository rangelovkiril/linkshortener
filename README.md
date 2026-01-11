# Link Shortener

Пълно приложение за съкращаване на URLs с multi-tier subscriptions.

## Структура

- `backend/` - NestJS API
- `frontend/` - React UI
- `k8s/` - Kubernetes manifests

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Kubernetes
```bash
cd k8s
./deploy.sh
```

Виж PROJECT_SETUP.md за детайлни инструкции.
