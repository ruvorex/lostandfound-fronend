# Frontend Deployment Guide (React + Vite + Amplify)

This document details how to set up and run the frontend locally and deploy via AWS Amplify.

---

## Prerequisites

- Node.js 14+ with npm installed

---

## Steps

### 1. Clone the Frontend Repository

```bash
git clone https://github.com/ruvorex/lostandfound.git
cd frontend-directory
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:
```
VITE_API_URL=https://your-api-url/api/
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
VITE_COGNITO_IDENTITY_POOL_ID=your-identity-pool-id
```

### 4. Run Locally

```bash
npm run dev
```

**Local URL:** [http://localhost:3000](http://localhost:3000)

### 5. Deploy via AWS Amplify

1. Go to the AWS Amplify Console.
2. Connect your GitHub repo and set environment variables.
3. Amplify will automatically deploy on pushes.
