<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=INKWIRE&fontSize=80&fontColor=ffffff&fontAlignY=35&desc=AI-Powered+News+Publishing+Platform&descAlignY=55&descSize=22&descColor=ffffff&animation=fadeIn" />

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&pause=1000&color=8B5CF6&center=true&vCenter=true&width=700&lines=The+world's+most+important+stories.;Automated.+Reviewed.+Published.;Gemini+AI+writes+the+news+for+you.;BBC-quality+articles+on+autopilot." alt="Typing SVG" />

<br/><br/>

<a href="https://github.com/26Utkarsh/InkWire"><img src="https://img.shields.io/badge/🚀%20Live%20Demo-8B5CF6?style=for-the-badge" /></a>
&nbsp;
<img src="https://img.shields.io/badge/Stack-MERN-00ED64?style=for-the-badge&logo=mongodb&logoColor=white" />
&nbsp;
<img src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" />
&nbsp;
<img src="https://img.shields.io/badge/Frontend-React%2018%20+%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
&nbsp;
<img src="https://img.shields.io/badge/Security-Hardened-22C55E?style=for-the-badge&logo=shield&logoColor=white" />
&nbsp;
<img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge" />

<br/><br/>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="700" />

</div>

<br/>

---

<div align="center">

## 💀 The Problem

</div>

```
Running a news website means:

  → Finding stories manually         (2 hrs/day)
  → Writing full articles            (3 hrs/day)
  → Finding images + formatting      (1 hr/day)
  → Publishing + scheduling          (1 hr/day)
  → Sending newsletters              (30 min/day)
                                     ───────────
                                     7.5 hrs wasted · every single day
```

<div align="center">

### ⚡ InkWire does all of this automatically. Every day. While you sleep.

</div>

<br/>

---

<div align="center">

## 🧠 How InkWire Works

<img src="https://user-images.githubusercontent.com/74038190/229223263-cf2e4b07-2615-4f87-9c38-e37600f8381a.gif" width="400" />

</div>

```mermaid
flowchart LR
    A[📡 BBC · Reuters\nThe Hindu · TechCrunch\nNDTV · Al Jazeera] --> B

    B[🏆 Ranking Service\nFilter & Score\nTop Stories] --> C

    C[🤖 Gemini 2.5 Flash\nWrite BBC-style\nFull Article] --> D

    D[🖼️ Unsplash API\nHero Image\nAttached] --> E

    E[📋 Review Queue\nAdmin Approval\nInline Edit] --> F

    F[⏰ Cron Scheduler\n8AM · 1PM · 7PM IST\nAuto-Publish] --> G

    G[🌐 Live Website\nPublic Readers] --> H
    G --> I

    H[📧 Newsletter\nSubscribers]
    I[🔖 Bookmarks\nSaved Articles]

    style A fill:#DC2626,color:#fff
    style B fill:#7C3AED,color:#fff
    style C fill:#4285F4,color:#fff
    style D fill:#0F9D58,color:#fff
    style E fill:#F59E0B,color:#000
    style F fill:#8B5CF6,color:#fff
    style G fill:#1F2937,color:#fff
    style H fill:#DC2626,color:#fff
    style I fill:#0284C7,color:#fff
```

<br/>

---

<div align="center">

## ✨ Features

</div>

<table>
<tr>
<td align="center" width="33%">
<img src="https://user-images.githubusercontent.com/74038190/212257454-16e3712e-945a-4ca2-b238-408ad0bf87e6.gif" width="80" /><br/>
<b>🤖 AI Writing Engine</b><br/>
Gemini 2.5 Flash writes full BBC-style long-form articles. Groq LLaMA 70B as fallback. Zero human writing needed.
</td>
<td align="center" width="33%">
<img src="https://user-images.githubusercontent.com/74038190/212257472-08e52665-c503-4bd9-aa20-f5a4dae769b5.gif" width="80" /><br/>
<b>📡 Smart News Crawler</b><br/>
Aggregates 7+ premium RSS feeds globally and in India. Ranks, filters noise, picks only what matters.
</td>
<td align="center" width="33%">
<img src="https://user-images.githubusercontent.com/74038190/212257468-1e9a91f1-b626-4baa-b15d-5c385dfa7ed2.gif" width="80" /><br/>
<b>⏰ Auto-Publish Cron</b><br/>
3 scheduled publish slots daily — 8AM, 1PM, 7PM IST. Fully automated. No manual intervention.
</td>
</tr>
<tr>
<td align="center" width="33%">
<img src="https://user-images.githubusercontent.com/74038190/212257465-7ce8d493-cac5-494e-982a-5a9deb852c4b.gif" width="80" /><br/>
<b>📊 Editorial Dashboard</b><br/>
Real-time control room with live stats, article queue, bulk approve/reject, and system health panel.
</td>
<td align="center" width="33%">
<img src="https://user-images.githubusercontent.com/74038190/212257460-738ff738-247f-4445-a718-cdd0ca76e2db.gif" width="80" /><br/>
<b>🔒 Security Hardened</b><br/>
HttpOnly JWT cookies, CSRF protection, rate limiting, CSP headers, mass assignment protection. XSS-proof.
</td>
<td align="center" width="33%">
<img src="https://user-images.githubusercontent.com/74038190/212257463-4d082cb9-7808-4fce-93d6-f9a9d671d06c.gif" width="80" /><br/>
<b>💰 AdSense Ready</b><br/>
Built to pass Google AdSense review. Privacy policy, about, terms pages included. Ad slots activate with one env var.
</td>
</tr>
</table>

<br/>

---

<div align="center">

## 🛠️ Tech Stack

<img src="https://skillicons.dev/icons?i=react,nodejs,express,mongodb,vite,js,css,git&theme=dark" />

</div>

<br/>

<div align="center">

| Layer | Technology | Details |
|:---:|:---:|:---|
| ⚛️ **Frontend** | React 18 + Vite 5 | BBC-inspired layout, Playfair Display, dark/light adaptive |
| 🎨 **Styling** | Vanilla CSS + CSS Variables | GPU-accelerated animations, mobile-first, 320px → 1400px+ |
| ⚙️ **Backend** | Node.js + Express 4 | REST API, modular services, cron scheduler |
| 🗄️ **Database** | MongoDB Atlas (Mongoose) | Articles, admin, newsletter subscribers |
| 🤖 **AI Primary** | Google Gemini 2.5 Flash | Full article writing, SEO optimization |
| 🔄 **AI Fallback** | Groq LLaMA 70B | Auto-switches if Gemini fails |
| 🔐 **Auth** | JWT in HttpOnly Cookie | XSS-proof, bcrypt password hashing |
| 🖼️ **Images** | Unsplash API | Auto hero images for every article |
| 📧 **Email** | Nodemailer (Gmail SMTP) | Newsletter dispatch + admin notifications |
| 🚀 **Hosting** | Render + Netlify | Backend + frontend, CI/CD on push |

</div>

<br/>

---

## 🚀 Quick Start

### 1. Clone
```bash
git clone https://github.com/26Utkarsh/InkWire.git && cd InkWire
```

### 2. Backend `.env`
```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_hex_secret
JWT_EXPIRES_IN=8h
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=your_password
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
NEWS_API_KEY=your_newsapi_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

### 3. Run
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

> Frontend → `http://localhost:5173` · Admin → `http://localhost:5173/admin/login`

<br/>

---

<div align="center">

## 📁 Structure

</div>

```
InkWire/
│
├── 📁 backend/
│   ├── ⚙️  config/          # DB, sources, topics, AI prompts
│   ├── 🎮 controllers/      # Auth, Admin, Article, Newsletter
│   ├── 🛡️  middleware/       # JWT, CSRF, rate limits, validation
│   ├── 📦 models/           # Admin · Article · Newsletter schemas
│   ├── 🛣️  routes/           # REST route mounting
│   ├── 🤖 services/         # NewsService · AIService · ImageService
│   │                        # EmailService · RankingService · SchedulerService
│   └── 🔧 utils/            # Logger, sanitizer, readTime, slugify
│
└── 📁 frontend/
    └── src/
        ├── 🧩 components/   # ArticleCard · Navbar · BookmarkButton · AdSlot
        ├── 📱 pages/        # Home · Article · Topic · Search · Saved · Admin
        ├── 🪝 hooks/        # useAdmin · useArticleDetail
        ├── 🏪 store/        # Zustand — auth + bookmarks (localStorage)
        └── 🎨 styles/       # variables · reset · typography · animations
```

<br/>

---

<div align="center">

## 🗺️ Roadmap

</div>

```
████████████████████████████████████████████████████  COMPLETE ✅

  ✅ Smart crawler — 7+ RSS feeds globally + India
  ✅ Gemini 2.5 Flash article writing + Groq fallback
  ✅ 3x daily auto-publish cron (8AM · 1PM · 7PM IST)
  ✅ Editorial dashboard — queue, approve, reject, edit
  ✅ Bookmark system with localStorage persistence
  ✅ Newsletter dispatch via Nodemailer
  ✅ HttpOnly JWT + CSRF + rate limiting + CSP
  ✅ AdSense-ready structure
  ✅ Brotli/Gzip + code splitting + lazy loading
  ✅ Wikipedia import + custom article generator
  ✅ Deployed: Render (backend) + Netlify (frontend)

░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  COMING 🚧

  ○ Reader accounts + personalized feed
  ○ Comment system with moderation
  ○ SEO sitemap + structured data (JSON-LD)
  ○ PWA — offline reading
  ○ Multi-language article generation
```

<br/>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&text=Automated+·+Secure+·+Production+Ready&fontSize=16&fontColor=ffffff&fontAlignY=65&animation=fadeIn" />

<br/>

**[🚀 Live Demo](https://github.com/26Utkarsh/InkWire)** &nbsp;·&nbsp; **[🐛 Report Bug](https://github.com/26Utkarsh/InkWire/issues)** &nbsp;·&nbsp; **[💡 Request Feature](https://github.com/26Utkarsh/InkWire/issues)**

<br/>

Built by [**26Utkarsh**](https://github.com/26Utkarsh)

<img src="https://komarev.com/ghpvc/?username=26Utkarsh&label=Profile+Views&color=8B5CF6&style=flat-square" />

</div>
