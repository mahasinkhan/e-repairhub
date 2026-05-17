# E-RepairHub

Monorepo: `backend` API + `apps/*` frontends + `packages/*` shared code.

## GitHub

```bash
git init
git add .
git commit -m "Initial commit: E-RepairHub monorepo"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/E-RepairHub.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Create an empty repo on GitHub first (no README).

## Render (backend API)

1. Push this repo to GitHub.
2. [Render](https://render.com) → **New** → **Blueprint** (uses `render.yaml`) or **Web Service** → connect repo.
3. If not using Blueprint, set:
   - **Build:** `npm ci && npm run build -w @e-repairhub/backend`
   - **Start:** `npm run start -w @e-repairhub/backend`
   - **Health check path:** `/health`
4. **Environment variables** (required):

   | Variable | Example |
   |----------|---------|
   | `MONGO_URI` | MongoDB Atlas connection string |
   | `JWT_SECRET` | Long random string |
   | `CLIENT_ORIGINS` | `https://your-app.onrender.com` (comma-separated frontend URLs) |

   Optional: `JWT_EXPIRES_IN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

5. After deploy, API base URL is your Render service URL; test `GET /health`.

See `backend/.env.example` for local development.
