# Meal Planner

AI-powered meal planning demo application for nutrition professionals.

## Features

- **Client Management** - Create and manage client profiles
- **AI Meal Plan Generation** - Generate personalized meal plans using AI
- **Two Plan Types:**
  - **Flexible** (2 weeks) - Multiple meal options per category
  - **Structured** (7 days) - Specific meals assigned to each day
- **Public Sharing** - Share meal plans with clients via unique links
- **Nutritional Tracking** - Track calories, protein, carbs, and fats

## Demo Mode

This app runs in **demo mode** by default:
- All data is stored in your browser's localStorage
- Includes sample client and meal plans
- AI generation returns mock responses
- No backend or API keys required

## Quick Start

```bash
# Clone the repository
git clone https://github.com/ankaravanas/Meal-Planner.git
cd Meal-Planner

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui + Radix UI
- **State:** React Query + React Hook Form + Zod
- **Storage:** localStorage (demo mode)
- **AI:** OpenAI GPT-4 (optional, via Vercel API route)

## Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ankaravanas/Meal-Planner)

### Option 2: Manual Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Click "Deploy"

That's it! The app works without any environment variables in demo mode.

### Enable Real AI Generation (Optional)

To use real OpenAI for meal plan generation:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. In Vercel dashboard, go to Settings → Environment Variables
3. Add: `OPENAI_API_KEY` = your-api-key
4. Redeploy

## Project Structure

```
meal-planner/
├── api/                    # Vercel serverless functions
│   └── generate-meal-plan.ts
├── src/
│   ├── components/         # UI components
│   ├── contexts/           # React contexts (Auth)
│   ├── integrations/       # External integrations
│   ├── mocks/              # Mock data layer
│   │   ├── data/           # Seed data
│   │   └── mockSupabaseClient.ts
│   ├── pages/              # Route components
│   ├── services/           # Business logic
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
└── vercel.json             # Vercel configuration
```

## Available Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth` | Login page |
| `/dashboard` | Admin dashboard |
| `/clients` | Client list |
| `/meal-plans` | All meal plans |
| `/meal-plans/new` | Create new plan |
| `/plan/:shareToken` | Public meal plan view |

## Demo Data

The app comes with sample data:
- **1 Demo Client:** Maria Demo
- **2 Meal Plans:**
  - Structured plan (7 days)
  - Flexible plan (with options)

To reset demo data, clear your browser's localStorage.

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run lint
```

## License

MIT
