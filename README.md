# InkWire — AI-Powered News Publishing Platform

> *"The world's most important stories, written for you."*

InkWire is a production-grade, fully automated AI news publishing platform. It fetches thousands of global and India headlines daily, uses AI to write complete editorial articles, sends drafts to an admin for review, and publishes on a fixed schedule with Google AdSense monetization built in.

---

## 1. What InkWire Is

| Feature | Detail |
|---|---|
| **News Sources** | NewsAPI + GNews + 7 RSS feeds (BBC, Reuters, The Hindu, TOI, TechCrunch, Al Jazeera, NDTV) |
| **AI Writing** | Gemini 1.5 Flash (primary) + Groq LLaMA 70B (fallback) |
| **Editorial Control** | Admin reviews every draft — nothing publishes without approval |
| **Publishing Schedule** | 8:00 AM + 1:00 PM + 7:00 PM IST |
| **Monetization** | Google AdSense slots pre-built in layout |
| **Frontend** | React + Vite, NYT-style editorial design |
| **Backend** | Node.js + Express, MVC architecture |
| **Database** | MongoDB Atlas |

---

## 2. Full Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, React Router 6, Zustand, Quill.js |
| Backend | Node.js 18+, Express 4, node-cron |
| Database | MongoDB Atlas (Mongoose 7) |
| AI | Google Gemini 1.5 Flash + Groq (LLaMA 70B) |
| News | NewsAPI + GNews + RSS Parser |
| Images | Unsplash API |
| Email | Nodemailer (Gmail) |
| Auth | JWT + bcrypt |
| Security | Helmet.js, CORS, express-rate-limit |
| Logging | Winston |
| Hosting | Render (backend) + Netlify (frontend) |

---

## 3. Prerequisites

Before you start, you need:
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **MongoDB Atlas account** — [mongodb.com/atlas](https://mongodb.com/atlas) (free tier is fine)
- **API Keys** (see Section 5 below)

---

## 4. Setup

```bash
# 1. Clone the project
git clone [your-repo-url]
cd inkwire

# 2. Setup backend
cd backend
cp ../.env.example .env
# Edit .env with your API keys (see Section 5)
npm install

# 3. Setup frontend
cd ../frontend
npm install

# 4. Start development
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev

# Open http://localhost:5173
```

---

## 5. Getting All API Keys

### NewsAPI (Required — free tier)
1. Go to [newsapi.org](https://newsapi.org) → Register
2. Copy your API key → add to `.env` as `NEWS_API_KEY`
3. Free tier: 100 requests/day (sufficient for 1 daily generation)

### GNews (Required — free tier)
1. Go to [gnews.io](https://gnews.io) → Register
2. Copy your API key → add to `.env` as `GNEWS_API_KEY`
3. Free tier: 100 requests/day

### Google Gemini (Required)
1. Go to [aistudio.google.com](https://aistudio.google.com) → Get API key
2. Add to `.env` as `GEMINI_API_KEY`
3. Free quota available

### Groq (Recommended — fallback AI)
1. Go to [console.groq.com](https://console.groq.com) → Register
2. Create API key → add to `.env` as `GROQ_API_KEY`
3. Free tier: generous limits

### Unsplash (Optional — article images)
1. Go to [unsplash.com/developers](https://unsplash.com/developers) → New Application
2. Copy Access Key → add to `.env` as `UNSPLASH_ACCESS_KEY`
3. Free tier: 50 requests/hour

### Gmail App Password (Required for email alerts)
1. Enable 2FA on your Gmail account
2. Go to myaccount.google.com → Security → App Passwords
3. Generate password for "Mail" + "Other device"
4. Add to `.env` as `EMAIL_PASS` (NOT your real Gmail password)

### MongoDB Atlas (Required)
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user
3. Get connection string → add to `.env` as `MONGODB_URI`
4. Whitelist IP: `0.0.0.0/0` (or Render's IP)

---

## 6. Folder Structure

```
inkwire/
├── backend/
│   ├── server.js              Entry point
│   ├── config/
│   │   ├── constants.js       All magic values (no magic numbers elsewhere)
│   │   ├── db.js              MongoDB connection
│   │   ├── sources.config.js  All news sources
│   │   ├── topics.config.js   Topic definitions + keywords
│   │   └── ai.config.js       AI model config + article prompt
│   ├── models/
│   │   ├── Article.js         Article schema
│   │   ├── Admin.js           Admin user schema (with lockout)
│   │   └── Newsletter.js      Subscriber schema
│   ├── services/
│   │   ├── NewsService.js     Fetches headlines from all sources
│   │   ├── AIService.js       Gemini + Groq article writing
│   │   ├── RankingService.js  Scores + selects top 6 stories
│   │   ├── ImageService.js    Unsplash image fetching
│   │   ├── SchedulerService.js 5 cron jobs (generation + publishing)
│   │   ├── EmailService.js    Admin alerts + reminders
│   │   └── NewsletterService.js Daily digest to subscribers
│   ├── controllers/           Business logic (no DB calls here)
│   ├── routes/                HTTP endpoints (no logic here)
│   ├── middleware/            JWT auth, rate limit, validation, errors
│   └── utils/                Logger, readTime, slugify, sanitize
│
└── frontend/
    └── src/
        ├── components/        Reusable React components
        │   ├── layout/        Navbar, Footer, AdminLayout
        │   ├── article/       ArticleCard, FeaturedCard, ArticleBody, ArticleMeta
        │   └── ui/            Toast, Badge, Skeleton, AdSlot, NewsletterForm
        ├── pages/             Route-level page components
        │   └── admin/         Admin dashboard pages
        ├── services/          API call functions
        ├── hooks/             Custom React hooks
        ├── store/             Zustand global state
        └── styles/            CSS design system
```

---

## 7. How to Add a New News Source

Only 3 steps — nothing else changes:

1. Open `backend/config/sources.config.js`
2. Add your source to the appropriate section:

```javascript
// For RSS feeds:
{ name: 'Your Source', url: 'https://example.com/rss.xml', topic: 'world', credibilityScore: 80 }

// For API sources:
// Add enabled: true, endpoint, params, credibilityScore
```

3. Save the file — the next generation cycle will include it automatically.

---

## 8. How to Add a New Topic

Only 3 steps — nothing else changes:

1. Open `backend/config/topics.config.js`
2. Add your topic:

```javascript
{
  id: 'sports',
  label: 'Sports',
  color: '#16a34a',
  keywords: ['cricket', 'football', 'IPL', 'FIFA', 'Olympic', 'match'],
}
```

3. Open `frontend/src/constants/index.js` and add the same topic to the `TOPICS` array.

The new topic will appear in the navbar, topic pages, and article classification automatically.

---

## 9. AdSense Monetization Guide

### Step-by-Step to Earning

**Phase 1: Build content (Week 1–2)**
InkWire publishes 4–6 articles daily automatically. After 2 weeks, you'll have 20–30 articles — the minimum needed for AdSense.

**Phase 2: Apply for AdSense**
1. Go to [google.com/adsense](https://google.com/adsense)
2. Sign in → Add site → Enter your InkWire URL
3. Google reviews site (2–14 days)
4. Requirements InkWire meets automatically:
   - ✅ Original content (AI writes unique articles)
   - ✅ Professional design
   - ✅ About page
   - ✅ Privacy Policy page
   - ✅ 15+ published articles

**Phase 3: Configure ad slots**
After approval:
1. Get your Publisher ID: `ca-pub-XXXXXXXXXXXXXXXX`
2. Add to Netlify environment: `VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX`
3. Create 3 ad units in AdSense dashboard (leaderboard, rectangle, sidebar)
4. Update slot IDs in `frontend/src/components/ui/AdSlot.jsx`

**Realistic Earnings Estimate**

| Traffic | Monthly Revenue |
|---|---|
| 500–2,000 visitors | ₹50–₹200 |
| 5,000–10,000 visitors | ₹500–₹2,000 |
| 50,000+ visitors | ₹5,000–₹25,000 |

---

## 10. Deployment Guide

### Backend → Render.com (Free)

1. Create account at [render.com](https://render.com)
2. New Web Service → Connect your GitHub repo
3. Settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Root Directory: `backend`
4. Add all environment variables from `.env` in the Render dashboard
5. Deploy → get your URL: `https://inkwire-api.onrender.com`
6. Set up UptimeRobot to ping `/health` every 5 minutes (keeps free tier alive)

### Frontend → Netlify (Free)

1. Create account at [netlify.com](https://netlify.com)
2. New Site → Deploy from GitHub
3. Settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Base Directory: `frontend`
4. Add environment variable:
   - `VITE_API_URL=https://inkwire-api.onrender.com`
5. Deploy → get your URL: `https://inkwire.netlify.app`

### Post-Deployment Checklist

- [ ] Update `FRONTEND_URL` in Render env vars to your Netlify URL
- [ ] Test admin login at `/admin/login`
- [ ] Trigger manual generation: Dashboard → "Generate Now"
- [ ] Approve first articles in queue
- [ ] Submit sitemap to Google Search Console: `/api/v1/sitemap.xml`
- [ ] Apply for Google AdSense after 20+ articles published

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Random 64-byte hex string |
| `ADMIN_EMAIL` | ✅ | Your admin login email |
| `ADMIN_PASSWORD` | ✅ | Your admin password (hashed on first run) |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `NEWS_API_KEY` | ✅ | newsapi.org API key |
| `GROQ_API_KEY` | ⚠️ | Groq API key (fallback AI — recommended) |
| `GNEWS_API_KEY` | ⚠️ | GNews API key (additional headlines) |
| `UNSPLASH_ACCESS_KEY` | ⚠️ | Unsplash API key (article images) |
| `EMAIL_USER` | ⚠️ | Gmail address for alerts |
| `EMAIL_PASS` | ⚠️ | Gmail App Password |
| `EMAIL_TO` | ⚠️ | Where admin alerts are sent |

---

*Built with ❤️ using React, Node.js, MongoDB, and Google Gemini AI*
