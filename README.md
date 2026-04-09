# The Essential EA — MVP

AI-powered task classification for real estate brokers and executives. Classify tasks as **Crystal Ball** (🔮 only you can do) or **Bouncy Ball** (🎾 delegate).

## Features

- ✨ AI-powered task classification using OpenAI GPT-3.5
- 📊 Task history with statistics
- 📥 Export tasks as CSV
- 📱 Fully responsive mobile-first design
- 🎯 Confidence scoring for each classification
- ⚡ Instant results with reasoning

## Tech Stack

**Frontend:**
- React 19 + Vite
- Tailwind CSS 4
- Mobile-responsive design

**Backend:**
- Node.js + Express
- OpenAI API (GPT-3.5-turbo)
- Better-SQLite3 for data persistence

**Deployment:**
- Vercel (Frontend)
- Railway (Backend)

## Quick Start

### Local Development

```bash
# Backend
cd server
npm install
echo 'OPENAI_API_KEY=sk-proj-xxx...' > .env
npm start

# Frontend (new terminal)
cd client
npm install
npm run dev
```

Open http://localhost:5173

### Deploy

**Backend to Railway:**
1. Create Railway account
2. Connect GitHub repo
3. Add `OPENAI_API_KEY` env var
4. Deploy

**Frontend to Vercel:**
1. Create Vercel account
2. Import GitHub repo (root: `client`)
3. Add `VITE_API_URL` env var (Railway URL)
4. Deploy

## API Endpoints

- `POST /api/classify` - Classify a task
- `GET /api/history` - Get task history
- `GET /api/stats` - Get statistics
- `GET /api/export` - Export as CSV

## Next Steps

- [ ] Gmail integration
- [ ] Slack integration  
- [ ] User authentication
- [ ] Team features
- [ ] Mobile app

---

**Built for busy brokers and executives**
