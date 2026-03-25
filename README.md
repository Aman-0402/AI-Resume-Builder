# AI Resume Builder

A full-stack, production-ready AI-powered resume builder web application. Built with React, Node.js, PostgreSQL, Prisma, and Google Gemini AI.

---

## Features

- **User Authentication** — Secure signup/login with JWT tokens and bcrypt password hashing
- **Resume Form Builder** — Tabbed form for Personal Info, Experience, Education, Skills, and Projects
- **Live Preview** — Real-time resume preview updates as you type
- **AI Content Generation** — Gemini AI generates professional summaries, experience bullet points, skill suggestions, and project descriptions
- **PDF Download** — One-click download of a clean A4-formatted resume via browser print
- **ATS Score Checker** — AI analyzes your resume against any job description and returns a score, strengths, improvements, missing keywords, and tips
- **Save & Edit** — All resumes and sections are persisted in PostgreSQL and can be edited anytime
- **Dashboard** — View, create, and delete all your resumes in one place

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| AI | Google Gemini API (`gemini-1.5-flash`) |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| PDF | react-to-print |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Icons | lucide-react |

---

## Project Structure

```
AI-Resume-Builder/
│
├── client/                          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top navigation bar
│   │   │   ├── ProtectedRoute.jsx   # Blocks unauthenticated access
│   │   │   └── resume/
│   │   │       ├── PersonalInfoForm.jsx   # Personal details + AI summary
│   │   │       ├── ExperienceForm.jsx     # Work experience + AI bullets
│   │   │       ├── EducationForm.jsx      # Education history
│   │   │       ├── SkillsForm.jsx         # Skills + AI suggestions
│   │   │       ├── ProjectsForm.jsx       # Projects + AI description
│   │   │       ├── ResumePreview.jsx      # Live preview (dark UI)
│   │   │       ├── ResumePrint.jsx        # Printable A4 component (PDF)
│   │   │       └── AtsChecker.jsx         # ATS score + analysis UI
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state (login/logout)
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Register page
│   │   │   ├── Dashboard.jsx        # Resume list + create/delete
│   │   │   └── ResumeBuilder.jsx    # Main builder page (tabs + preview)
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance with JWT interceptor
│   │   │   └── aiService.js         # All AI API call functions
│   │   ├── App.jsx                  # Routes setup
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Tailwind + print CSS
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Node.js backend
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema (6 models)
│   │   └── migrations/              # Auto-generated SQL migrations
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # register, login, getMe
│   │   │   ├── resume.controller.js # Full CRUD for resume + all sections
│   │   │   └── ai.controller.js     # AI generation endpoints
│   │   ├── middleware/
│   │   │   └── auth.middleware.js   # JWT verification middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.js       # /api/auth/*
│   │   │   ├── resume.routes.js     # /api/resumes/*
│   │   │   └── ai.routes.js         # /api/ai/*
│   │   ├── utils/
│   │   │   ├── prisma.js            # Shared Prisma client (singleton)
│   │   │   └── gemini.js            # Gemini AI SDK wrapper
│   │   └── app.js                   # Express app setup
│   ├── server.js                    # Server entry point
│   ├── prisma.config.ts             # Prisma v7 config
│   └── .env                         # Environment variables
│
└── package.json                     # Root workspace (concurrently)
```

---

## Database Schema

```
User
 └── has many → Resume
                 ├── has many → Experience
                 ├── has many → Education
                 ├── has many → Skill
                 └── has many → Project
```

All child records cascade-delete when their parent resume is deleted.

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Login, get JWT token | No |
| GET | `/api/auth/me` | Get logged-in user info | Yes |

### Resumes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resumes` | Create new resume |
| GET | `/api/resumes` | Get all my resumes |
| GET | `/api/resumes/:id` | Get one resume with all sections |
| PUT | `/api/resumes/:id` | Update resume header/summary |
| DELETE | `/api/resumes/:id` | Delete resume (cascades) |

### Resume Sections (Experience / Education / Skill / Project)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resumes/:id/experience` | Add experience |
| PUT | `/api/resumes/:id/experience/:eid` | Update experience |
| DELETE | `/api/resumes/:id/experience/:eid` | Delete experience |

Same pattern applies for `/education`, `/skill`, and `/project`.

### AI
| Method | Endpoint | Input | Output |
|---|---|---|---|
| POST | `/api/ai/summary` | name, jobTitle, skills, tone | Professional summary paragraph |
| POST | `/api/ai/experience` | position, company, skills | 4-5 bullet points |
| POST | `/api/ai/skills` | jobTitle, existingSkills | Array of 12 skill suggestions |
| POST | `/api/ai/project` | projectName, techStack | Project description |
| POST | `/api/ai/ats-score` | resume, jobDescription | Score, grade, strengths, improvements, tips |

---

## Prerequisites

- [Node.js](https://nodejs.org) v18+
- [PostgreSQL](https://www.postgresql.org) v14+ running locally
- [Google Gemini API Key](https://aistudio.google.com/app/apikey) (free)

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Aman-0402/AI-Resume-Builder.git
cd AI-Resume-Builder
```

### 2. Install root dependencies

```bash
npm install
```

### 3. Install client dependencies

```bash
cd client
npm install
cd ..
```

### 4. Install server dependencies

```bash
cd server
npm install
cd ..
```

### 5. Configure environment variables

Open `server/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_strong_secret_key_here

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_resume_builder"

# Get free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

### 6. Run database migrations

```bash
cd server
npx prisma migrate dev --name init
```

This creates the PostgreSQL database and all 6 tables automatically.

### 7. Start the application

**Option A — Run both together from root:**
```bash
npm run dev
```

**Option B — Run separately:**
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

### 8. Open in browser

```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

## How to Use

### 1. Create an Account
Go to `http://localhost:5173/register` and sign up.

### 2. Create a Resume
Click **New Resume** on the dashboard. A blank resume is created and you are taken to the builder.

### 3. Fill in Your Details
Use the **6 tabs** in the builder:
- **Personal** — name, contact, summary (with AI generation)
- **Experience** — work history (with AI bullet point generation)
- **Education** — degrees and institutions
- **Skills** — skills with levels and categories (with AI suggestions)
- **Projects** — portfolio projects (with AI description generation)
- **ATS** — check your resume score against any job description

### 4. Download as PDF
Click the green **Download PDF** button at the top right. The browser print dialog opens — select **Save as PDF**.

### 5. Check ATS Score
Go to the **ATS tab**, optionally paste a job description, and click **Check ATS Score**. The score is saved to your resume and shown on the dashboard.

---

## AI Features Explained

### Summary Generator
Provide your target job title, years of experience, and tone. Gemini writes a 3-4 sentence ATS-optimized professional summary using your existing skills as context.

### Experience Bullet Points
Enter the company and position. Gemini generates 4-5 achievement-focused bullet points with action verbs and quantifiable metrics.

### Skill Suggestions
Enter your target job title. Gemini returns 12 in-demand skills for that role, excluding ones you already have.

### Project Description
Enter the project name and tech stack. Gemini writes a concise 2-3 sentence description.

### ATS Score Checker
Gemini analyzes your full resume (all sections) against an optional job description and returns:
- Score (0–100) with grade (A+/A/B+/B/C/D)
- Strengths list
- Areas to improve
- Missing keywords
- Pro tips

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GEMINI_API_KEY` | Yes | Google Gemini API key (free tier available) |

---

## Scripts

| Command | Directory | Description |
|---|---|---|
| `npm run dev` | root | Start both client and server |
| `npm run client` | root | Start frontend only |
| `npm run server` | root | Start backend only |
| `npm run dev` | server | Start backend with nodemon |
| `npm run dev` | client | Start Vite dev server |
| `npx prisma studio` | server | Open visual database browser |
| `npx prisma migrate dev` | server | Run new migrations |

---

## License

MIT — free to use, modify, and distribute.
