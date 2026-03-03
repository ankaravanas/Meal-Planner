import type { VercelRequest, VercelResponse } from '@vercel/node';

// Required categories - must match exactly
const REQUIRED_CATEGORIES = [
  'Πρωινό',
  'Δεκατιανό/Snack',
  'Μεσημεριανό',
  'Απογευματινό',
  'Βραδινό'
];

interface AIGenerationRequest {
  clientName: string;
  planType: 'flexible' | 'structured';
  systemPrompt?: string;
  userPrompt?: string;
  aiModel?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const request: AIGenerationRequest = req.body;

    if (!request.clientName || !request.planType) {
      return res.status(400).json({
        success: false,
        error: 'Client name and plan type are required'
      });
    }

    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured'
      });
    }

    const model = request.aiModel || 'gpt-4o';

    // Build system prompt
    const systemPrompt = request.systemPrompt || `You are an AI assistant for a professional nutritionist specializing in Mediterranean diet and holistic nutrition therapy.

RULES:
1. All responses in GREEK
2. Exact measurements: gr (grams), tbsp (tablespoons), tsp (teaspoons)
3. EACH meal MUST be COMPLETE with: protein + carbohydrate + fat + vegetables/fiber
4. Mediterranean diet with Greek ingredients
5. Fruits in numbers (e.g. "1 apple"), NOT in grams

RESPOND ONLY WITH VALID JSON.`;

    // Build user prompt with JSON format specification
    let userPrompt = request.userPrompt || `Create a ${request.planType} meal plan for ${request.clientName}.`;

    if (request.planType === 'flexible') {
      userPrompt += `

CRITICAL - JSON FORMAT (use EXACTLY this structure):
{
  "mealPlan": {
    "flexible": [
      {"categoryName": "Πρωινό", "options": ["meal 1 with quantities", "meal 2 with quantities", "..."]},
      {"categoryName": "Δεκατιανό/Snack", "options": ["snack 1", "snack 2", "..."]},
      {"categoryName": "Μεσημεριανό", "options": ["meal 1", "meal 2", "..."]},
      {"categoryName": "Απογευματινό", "options": ["snack 1", "snack 2", "..."]},
      {"categoryName": "Βραδινό", "options": ["meal 1", "meal 2", "..."]}
    ]
  },
  "reasoning": "brief explanation"
}

The categoryName MUST BE EXACTLY: "Πρωινό", "Δεκατιανό/Snack", "Μεσημεριανό", "Απογευματινό", "Βραδινό"`;
    } else {
      userPrompt += `

CRITICAL - JSON FORMAT (use EXACTLY this structure):
{
  "mealPlan": {
    "structured": [
      {"day": 1, "meals": {"Πρωινό": "meal with quantities", "Δεκατιανό/Snack": "snack", "Μεσημεριανό": "meal", "Απογευματινό": "snack", "Βραδινό": "meal"}},
      {"day": 2, "meals": {"Πρωινό": "...", "Δεκατιανό/Snack": "...", "Μεσημεριανό": "...", "Απογευματινό": "...", "Βραδινό": "..."}},
      ... (7 days total)
    ]
  },
  "reasoning": "brief explanation"
}

The keys in meals MUST BE EXACTLY: "Πρωινό", "Δεκατιανό/Snack", "Μεσημεριανό", "Απογευματινό", "Βραδινό"`;
    }

    userPrompt += '\n\nRESPOND ONLY WITH VALID JSON. NO MARKDOWN, NO BACKTICKS.';

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(500).json({
        success: false,
        error: `OpenAI API error: ${error.error?.message || 'Unknown error'}`
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return res.status(500).json({
        success: false,
        error: 'Empty response from OpenAI'
      });
    }

    // Parse JSON response
    let parsedResponse;
    try {
      // Handle markdown-wrapped JSON
      let jsonString = content;
      if (jsonString.includes('```json')) {
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      parsedResponse = JSON.parse(jsonString.trim());
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        error: `Failed to parse AI response: ${content.substring(0, 200)}`
      });
    }

    // Validate response structure
    const mealPlan = parsedResponse.mealPlan;
    if (!mealPlan) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response structure: missing mealPlan'
      });
    }

    // Validate categories
    if (request.planType === 'flexible' && mealPlan.flexible) {
      const categories = mealPlan.flexible.map((c: any) => c.categoryName);
      const missingCategories = REQUIRED_CATEGORIES.filter(c => !categories.includes(c));
      if (missingCategories.length > 0) {
        return res.status(500).json({
          success: false,
          error: `Missing categories: ${missingCategories.join(', ')}`
        });
      }
    }

    if (request.planType === 'structured' && mealPlan.structured) {
      if (mealPlan.structured.length !== 7) {
        return res.status(500).json({
          success: false,
          error: `Expected 7 days, got ${mealPlan.structured.length}`
        });
      }
    }

    return res.status(200).json({
      success: true,
      mealPlan,
      reasoning: parsedResponse.reasoning || ''
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
