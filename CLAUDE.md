# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## Project: Meal Planner (Demo)

A **demo** meal planning web application for nutrition professionals. This is a standalone version that runs entirely in the browser using localStorage — no backend required.

### What the App Does

- **Client Management** — CRUD for nutrition clients with profiles, dietary restrictions, goals
- **AI Meal Plan Generation** — OpenAI-powered plans following Greek Mediterranean diet principles
- **Two Plan Types:**
  - **Flexible** (2 weeks) — Multiple meal options per category, client chooses daily
  - **Structured** (7 days) — Specific meals assigned to each day
- **Public Sharing** — Clients access their plans via `/plan/:shareToken`
- **Nutritional Tracking** — Per-meal macros (calories, protein, carbs, fats)
- **Admin Dashboard** — Stats, recent clients with plan counts
- **Demo Mode** — All data stored in localStorage, includes sample data

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui + Radix UI |
| State | React Query + React Hook Form + Zod |
| Storage | localStorage (mock Supabase client) |
| AI | OpenAI GPT-4o via Vercel API route |

---

## Project Structure

```
meal-planner/
├── CLAUDE.md              # This file — core context
├── src/
│   ├── pages/             # Route components
│   ├── components/        # UI components (ui/, layout/, admin/, etc.)
│   ├── services/          # AI service, prompt builder
│   ├── contexts/          # AuthContext (simplified for demo)
│   ├── hooks/             # Custom hooks
│   ├── mocks/             # Mock Supabase client + seed data
│   │   ├── mockSupabaseClient.ts  # localStorage-based mock
│   │   └── data/
│   │       └── seedData.ts        # Demo client + meal plans
│   ├── integrations/      # Supabase client export (uses mock)
│   └── types/             # TypeScript definitions
├── api/                   # Vercel serverless functions
│   └── generate-meal-plan.ts      # OpenAI API route
├── public/                # Static assets
├── .claude/
│   └── commands/          # Slash commands (/prime, /create-plan, /implement)
└── plans/                 # Implementation plans
```

---

## App Architecture

### Key Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Index | Landing page |
| `/auth` | Auth | Simple "Enter" button (no real auth) |
| `/dashboard` | Dashboard | Admin stats & recent clients |
| `/clients` | Clients | Client list with search/filter |
| `/clients/:id` | ClientProfile | Client details + meal plans |
| `/meal-plans` | MealPlans | Browse all plans |
| `/meal-plans/new` | MealPlanWizard | Create plan with AI |
| `/meal-plans/edit/:id` | MealPlanWizard | Edit existing plan |
| `/plan/:shareToken` | PublicMealPlan | Public view (no auth) |
| `/settings` | Settings | App settings (AI model) |

### Mock Data Layer

The app uses a mock Supabase client (`src/mocks/mockSupabaseClient.ts`) that:
- Stores all data in localStorage
- Provides the same API as real Supabase (from, select, eq, insert, update, delete)
- Initializes with demo data on first load

**localStorage Keys:**
```
meal_planner_clients
meal_planner_meal_plans
meal_planner_flexible_options
meal_planner_structured_meals
meal_planner_meal_categories
meal_planner_app_settings
```

### Services

| Service | Purpose |
|---------|---------|
| `aiService.ts` | AI generation API calls (uses Vercel route or mock) |
| `promptBuilderService.ts` | Prompt assembly with client context |
| `knowledgeBaseService.ts` | Stats for meals, plans, clients |

### AI Generation Flow

1. User fills MealPlanWizard form (client, plan type, targets)
2. `promptBuilderService.ts` assembles prompt with client context
3. `aiService.ts` calls `/api/generate-meal-plan` (Vercel function)
4. API route calls OpenAI with Greek nutritionist persona
5. Response parsed and saved to localStorage via mock client

---

## Demo Data

The app comes pre-loaded with:
- **1 Demo Client:** Maria Demo (runner, training 4x/week)
- **2 Meal Plans:**
  - Structured plan (7 days, 35 meals)
  - Flexible plan (20+ meal options)

To reset demo data: Clear localStorage keys starting with `meal_planner_`

---

## Commands

### /prime

**Purpose:** Initialize a new session with full context awareness.

Run at the start of every session. Claude will:
1. Read CLAUDE.md
2. Summarize understanding of the project
3. Confirm readiness to assist

### /create-plan [request]

**Purpose:** Create a detailed implementation plan before making changes.

Use for new features, refactoring, or structural changes. Produces a plan document in `plans/`.

Example: `/create-plan add dark mode support`

### /implement [plan-path]

**Purpose:** Execute a plan created by /create-plan.

Reads the plan, executes each step, validates the work, updates plan status.

Example: `/implement plans/2026-03-03-dark-mode.md`

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run lint
```

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Deploy (works immediately in demo mode)
4. *Optional:* Add `OPENAI_API_KEY` env var for real AI generation

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | OpenAI API key for real AI generation |

Without the API key, AI generation returns mock responses.

---

## Session Workflow

1. **Start:** Run `/prime` to load context
2. **Work:** Use commands or direct Claude with tasks
3. **Plan changes:** Use `/create-plan` before significant additions
4. **Execute:** Use `/implement` to execute plans
5. **Maintain:** Update CLAUDE.md as the project evolves

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/pages/MealPlanWizard.tsx` | Main meal plan creation |
| `src/pages/PublicMealPlan.tsx` | Public meal plan view for clients |
| `src/pages/Dashboard.tsx` | Admin dashboard with stats |
| `src/pages/ClientProfile.tsx` | Individual client view |
| `src/mocks/mockSupabaseClient.ts` | Mock Supabase with localStorage |
| `src/mocks/data/seedData.ts` | Demo data (client, plans, meals) |
| `src/services/aiService.ts` | AI generation API calls |
| `src/contexts/AuthContext.tsx` | Simplified auth (demo mode) |
| `src/components/layout/AppSidebar.tsx` | Navigation sidebar |
| `api/generate-meal-plan.ts` | Vercel serverless function for OpenAI |

---

## Notes

- App uses Greek language for meal descriptions
- AI prompts emphasize Mediterranean diet
- No real authentication — single "Enter" button
- Mobile-responsive with drawer navigation
- All data persists in localStorage across sessions
- GitHub repo: https://github.com/ankaravanas/Meal-Planner

---

## Critical: Meal Category Names

**Names MUST match exactly:**
```
Πρωινό
Δεκατιανό/Snack
Μεσημεριανό
Απογευματινό
Βραδινό
```

If AI returns different names (e.g., "Δεκατιανό" without "/Snack"), validation fails.
