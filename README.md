# 🔮 TrackMe Tarot

**The Internet Already Knows You. Let's See How Much.**

TrackMe Tarot is a zero-login browser fingerprinting demo disguised as a cyber-mystic tarot reading. It passively collects signals your browser leaks to every website you visit — then turns that data into a personalized, shareable "digital tarot card" with an exposure score.

No cookies. No accounts. No tracking pixels. Just the uncomfortable truth about browser fingerprinting, wrapped in Gen-Z humor and Hinglish/Urdu flavor.

---

## 🎯 Concept

Every time you visit a website, your browser silently broadcasts dozens of identifying signals: screen size, installed fonts, timezone, battery level, GPU capabilities, and more. Most people have no idea how much data they leak.

**TrackMe Tarot makes this visible** by:

1. **Scanning** your browser's passive signals (canvas hash, fonts, hardware, battery, network, etc.)
2. **Generating a fortune** — either via Google Gemini AI or a local fallback engine with 13 handcrafted archetypes
3. **Computing an Exposure Score** (0–100) that rates how trackable you are
4. **Rendering a shareable 1080×1350 HD tarot card** you can download or share on WhatsApp/LinkedIn

It's privacy awareness that people actually finish — because it's fun, slightly eerie, and highly shareable.

---

## 🔒 Privacy Promise

> **Nothing you see here leaves your browser, except a summary sent to generate your fortune. We store nothing.**

- ✅ **Zero cookies** — no tracking cookies, no session cookies
- ✅ **No accounts** — zero login required
- ✅ **100% client-side** — all fingerprinting runs in your browser
- ✅ **No data storage** — we don't save your signals, scores, or readings
- ✅ **No IP logging** — the AI prompt explicitly excludes precise location
- ✅ **Transparent** — the fortune prompt is visible in the source code
- ✅ **What goes to the API** — only a sanitized summary of browser signals (OS, screen size, timezone, battery level) is sent to generate the fortune text. The raw fingerprint hash never leaves your device.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧬 Browser Fingerprinting | 20+ passive signals via Canvas, fonts, hardware, battery, network APIs |
| 🤖 AI Fortunes | Google Gemini-powered readings with Hinglish/Urdu Gen-Z humor |
| 🎭 Local Fallback | 13 handcrafted archetypes ensure the demo never breaks |
| 📊 Exposure Score | 0–100 score with animated circular gauge and detailed breakdown |
| 🎴 HD Tarot Cards | 1080×1350 canvas-generated shareable cards |
| 📱 Share Anywhere | Web Share API, WhatsApp, LinkedIn, clipboard copy |
| 🏢 Teams Page | B2B landing page for enterprise security awareness campaigns |
| ♿ Accessible | Focus states, ARIA labels, skip-to-content, reduced motion support |
| 📱 Mobile-First | Fully responsive down to 375px width |

---

## 🛠 Tech Stack

- **Frontend**: Vanilla JavaScript (ES Modules), HTML5, CSS3
- **Build Tool**: [Vite](https://vitejs.dev/)
- **AI**: [Google Gemini API](https://ai.google.dev/) (1.5 Flash)
- **Canvas**: HTML5 Canvas API for HD card generation
- **Deployment**: Vercel (serverless functions for API) + GitHub Pages (static fallback)
- **Fonts**: JetBrains Mono + Cinzel (Google Fonts)

---

## 🚀 Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/umerkhan6967/trackme-tarot.git
cd trackme-tarot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Never commit this file.** It's already in `.gitignore`.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production

```bash
npm run build
npm run preview
```

---

## 🌐 Deployment

### Vercel (Recommended)

TrackMe Tarot is preconfigured for Vercel with serverless API support:

1. **Import** the GitHub repo on [vercel.com](https://vercel.com)
2. **Set environment variable** in Vercel Dashboard → Settings → Environment Variables:
   - Name: `GEMINI_API_KEY`
   - Value: your Gemini API key
3. **Deploy** — Vercel auto-detects the Vite framework and `vercel.json` config

The `vercel.json` handles:
- Build command: `npm run build`
- Output directory: `dist`
- API route: `/api/fortune` → serverless function

### GitHub Pages (Static Only)

For GitHub Pages (no API support — local fallback only):

1. Change `base` in `vite.config.js` from `'/'` to `'./'`
2. Push to `main` — the GitHub Actions workflow auto-deploys

> Note: GitHub Pages cannot run serverless functions, so the AI fortune will always fall back to the local rule-based engine.

---

## 📁 Project Structure

```
trackme-tarot/
├── api/
│   └── fortune.js          # Vercel serverless function (Gemini API proxy)
├── src/
│   ├── main.js              # App state orchestrator & screen transitions
│   ├── fingerprint.js       # Browser signal collection (20+ passive signals)
│   ├── fortune.js           # AI fortune fetcher + local fallback engine
│   ├── score.js             # Exposure score calculator (0–100)
│   ├── card.js              # 1080×1350 canvas card generator + sharing
│   ├── teams.js             # Teams page interactivity
│   └── style.css            # Complete design system & animations
├── teams/
│   └── index.html           # B2B landing page
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Pages auto-deploy
├── index.html               # Main app entry point
├── vite.config.js            # Vite build config with API middleware
├── vercel.json               # Vercel deployment config
├── .env                      # API keys (git-ignored)
└── .gitignore
```

---

## 📜 License

MIT — use it, fork it, make your team more privacy-aware.

---

<p align="center">
  <strong>◈ TRACKME TAROT ◈</strong><br>
  <em>The internet already knows you. Now you know too.</em>
</p>
