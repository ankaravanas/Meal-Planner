// Demo seed data for Meal Planner

export const MEAL_CATEGORIES = [
  {
    id: 'cat-1-breakfast',
    name: 'Πρωινό',
    display_name_greek: 'Πρωινό',
    display_order: 1,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-2-morning-snack',
    name: 'Δεκατιανό/Snack',
    display_name_greek: 'Δεκατιανό/Snack',
    display_order: 2,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-3-lunch',
    name: 'Μεσημεριανό',
    display_name_greek: 'Μεσημεριανό',
    display_order: 3,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-4-afternoon-snack',
    name: 'Απογευματινό',
    display_name_greek: 'Απογευματινό',
    display_order: 4,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-5-dinner',
    name: 'Βραδινό',
    display_name_greek: 'Βραδινό',
    display_order: 5,
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const DEMO_CLIENT = {
  id: 'demo-client-001',
  name: 'Maria Demo',
  email: 'maria@example.com',
  phone: '+30 6971234567',
  notes: 'Demo client - Runner, training 4 times/week',
  special_instructions: 'Breakfast after training (7:30)',
  dietary_restrictions: ['Gluten-free', 'Low lactose'],
  medical_conditions: 'Mild iron deficiency',
  goals: 'Increase muscle mass, improve athletic performance',
  food_preferences: 'Mediterranean diet, loves legumes',
  is_active: true,
  created_at: '2024-06-15T10:00:00Z',
  updated_at: '2024-11-20T14:30:00Z'
};

export const DEMO_STRUCTURED_PLAN = {
  id: 'demo-structured-001',
  client_id: 'demo-client-001',
  title: 'Weekly Plan - Maria',
  type: 'structured',
  status: 'active',
  start_date: '2024-11-25',
  ai_generated: true,
  ai_prompt_used: 'Structured plan for athlete...',
  created_at: '2024-11-20T10:00:00Z',
  updated_at: '2024-11-20T10:00:00Z',
  notes: 'Focus on protein after training',
  share_token: 'demo-structured-abc',
  nutritional_targets: {
    calories: 2200,
    protein: 130,
    carbs: 250,
    fats: 75
  }
};

export const DEMO_FLEXIBLE_PLAN = {
  id: 'demo-flexible-001',
  client_id: 'demo-client-001',
  title: 'Flexible Plan - Maria',
  type: 'flexible',
  status: 'active',
  start_date: '2024-12-01',
  ai_generated: true,
  ai_prompt_used: 'Flexible plan with options...',
  created_at: '2024-12-01T10:00:00Z',
  updated_at: '2024-12-01T10:00:00Z',
  notes: '2-week flexible plan with multiple options',
  share_token: 'demo-flexible-xyz',
  nutritional_targets: {
    calories: 2000,
    protein: 120,
    carbs: 220,
    fats: 70
  }
};

// Structured meals for 7 days
export const DEMO_STRUCTURED_MEALS = [
  // Day 1
  { id: 'sm-d1-b', meal_plan_id: 'demo-structured-001', day_number: 1, category_id: 'cat-1-breakfast', meal_description: '2 poached eggs with 1 slice whole wheat bread (60g)\n1 tbsp tahini\nSeasonal fruits' },
  { id: 'sm-d1-ms', meal_plan_id: 'demo-structured-001', day_number: 1, category_id: 'cat-2-morning-snack', meal_description: '200g 2% yogurt with honey and nuts\n1 small fruit' },
  { id: 'sm-d1-l', meal_plan_id: 'demo-structured-001', day_number: 1, category_id: 'cat-3-lunch', meal_description: 'Grilled chicken (150g) + roasted potatoes (200g)\nSalad with 1 tbsp olive oil' },
  { id: 'sm-d1-as', meal_plan_id: 'demo-structured-001', day_number: 1, category_id: 'cat-4-afternoon-snack', meal_description: '30g almonds\n1 apple' },
  { id: 'sm-d1-d', meal_plan_id: 'demo-structured-001', day_number: 1, category_id: 'cat-5-dinner', meal_description: 'Salmon (150g) + rice (80g raw)\nBroccoli (100g) + 1 tbsp olive oil' },

  // Day 2
  { id: 'sm-d2-b', meal_plan_id: 'demo-structured-001', day_number: 2, category_id: 'cat-1-breakfast', meal_description: 'Overnight oats with almond milk, banana, and cinnamon\n30g protein powder' },
  { id: 'sm-d2-ms', meal_plan_id: 'demo-structured-001', day_number: 2, category_id: 'cat-2-morning-snack', meal_description: '1 banana\n20g peanut butter' },
  { id: 'sm-d2-l', meal_plan_id: 'demo-structured-001', day_number: 2, category_id: 'cat-3-lunch', meal_description: 'Lentil soup (250g cooked)\n2 slices whole wheat bread\nFeta cheese (30g)' },
  { id: 'sm-d2-as', meal_plan_id: 'demo-structured-001', day_number: 2, category_id: 'cat-4-afternoon-snack', meal_description: 'Greek yogurt (150g)\n1 tbsp honey' },
  { id: 'sm-d2-d', meal_plan_id: 'demo-structured-001', day_number: 2, category_id: 'cat-5-dinner', meal_description: 'Grilled sea bream (180g)\nRoasted vegetables (200g)\n1 tbsp olive oil' },

  // Day 3
  { id: 'sm-d3-b', meal_plan_id: 'demo-structured-001', day_number: 3, category_id: 'cat-1-breakfast', meal_description: 'Scrambled eggs (2 eggs) with vegetables and feta\n1 slice whole wheat bread' },
  { id: 'sm-d3-ms', meal_plan_id: 'demo-structured-001', day_number: 3, category_id: 'cat-2-morning-snack', meal_description: '1 orange\n15g walnuts' },
  { id: 'sm-d3-l', meal_plan_id: 'demo-structured-001', day_number: 3, category_id: 'cat-3-lunch', meal_description: 'Turkey breast (150g) + quinoa (100g cooked)\nMixed salad with olive oil' },
  { id: 'sm-d3-as', meal_plan_id: 'demo-structured-001', day_number: 3, category_id: 'cat-4-afternoon-snack', meal_description: 'Rice cakes (2)\n1 tbsp almond butter' },
  { id: 'sm-d3-d', meal_plan_id: 'demo-structured-001', day_number: 3, category_id: 'cat-5-dinner', meal_description: 'Chickpea stew (200g cooked)\nBrown rice (80g raw)\nGreek salad' },

  // Day 4
  { id: 'sm-d4-b', meal_plan_id: 'demo-structured-001', day_number: 4, category_id: 'cat-1-breakfast', meal_description: 'Greek yogurt (200g) with granola (40g)\nMixed berries' },
  { id: 'sm-d4-ms', meal_plan_id: 'demo-structured-001', day_number: 4, category_id: 'cat-2-morning-snack', meal_description: '1 pear\n20g cashews' },
  { id: 'sm-d4-l', meal_plan_id: 'demo-structured-001', day_number: 4, category_id: 'cat-3-lunch', meal_description: 'Grilled pork tenderloin (150g)\nSweet potato (200g)\nSteamed green beans' },
  { id: 'sm-d4-as', meal_plan_id: 'demo-structured-001', day_number: 4, category_id: 'cat-4-afternoon-snack', meal_description: 'Cottage cheese (100g)\n1 tbsp honey' },
  { id: 'sm-d4-d', meal_plan_id: 'demo-structured-001', day_number: 4, category_id: 'cat-5-dinner', meal_description: 'Shrimp (150g) + whole wheat pasta (80g dry)\nTomato sauce with basil' },

  // Day 5
  { id: 'sm-d5-b', meal_plan_id: 'demo-structured-001', day_number: 5, category_id: 'cat-1-breakfast', meal_description: 'Avocado toast (1/2 avocado) on sourdough\n2 soft-boiled eggs' },
  { id: 'sm-d5-ms', meal_plan_id: 'demo-structured-001', day_number: 5, category_id: 'cat-2-morning-snack', meal_description: 'Protein smoothie (banana, milk, protein powder)' },
  { id: 'sm-d5-l', meal_plan_id: 'demo-structured-001', day_number: 5, category_id: 'cat-3-lunch', meal_description: 'Greek moussaka (200g)\nGreek salad\n1 slice bread' },
  { id: 'sm-d5-as', meal_plan_id: 'demo-structured-001', day_number: 5, category_id: 'cat-4-afternoon-snack', meal_description: '1 apple\n30g cheese' },
  { id: 'sm-d5-d', meal_plan_id: 'demo-structured-001', day_number: 5, category_id: 'cat-5-dinner', meal_description: 'Grilled cod (180g)\nMashed potatoes (150g)\nSpinach sauteed in olive oil' },

  // Day 6
  { id: 'sm-d6-b', meal_plan_id: 'demo-structured-001', day_number: 6, category_id: 'cat-1-breakfast', meal_description: 'Pancakes (2) with maple syrup\nGreek yogurt (100g)\nBerries' },
  { id: 'sm-d6-ms', meal_plan_id: 'demo-structured-001', day_number: 6, category_id: 'cat-2-morning-snack', meal_description: 'Trail mix (40g)' },
  { id: 'sm-d6-l', meal_plan_id: 'demo-structured-001', day_number: 6, category_id: 'cat-3-lunch', meal_description: 'Beef steak (150g)\nBaked potato (200g)\nCaesar salad' },
  { id: 'sm-d6-as', meal_plan_id: 'demo-structured-001', day_number: 6, category_id: 'cat-4-afternoon-snack', meal_description: 'Hummus (50g)\nCarrot sticks' },
  { id: 'sm-d6-d', meal_plan_id: 'demo-structured-001', day_number: 6, category_id: 'cat-5-dinner', meal_description: 'Stuffed peppers with rice and ground meat\nTzatziki sauce' },

  // Day 7
  { id: 'sm-d7-b', meal_plan_id: 'demo-structured-001', day_number: 7, category_id: 'cat-1-breakfast', meal_description: 'Omelette (3 eggs) with mushrooms and cheese\n1 slice whole wheat toast' },
  { id: 'sm-d7-ms', meal_plan_id: 'demo-structured-001', day_number: 7, category_id: 'cat-2-morning-snack', meal_description: 'Fresh fruit salad (200g)' },
  { id: 'sm-d7-l', meal_plan_id: 'demo-structured-001', day_number: 7, category_id: 'cat-3-lunch', meal_description: 'Roast chicken (150g)\nOrzo pasta (100g cooked)\nRoasted vegetables' },
  { id: 'sm-d7-as', meal_plan_id: 'demo-structured-001', day_number: 7, category_id: 'cat-4-afternoon-snack', meal_description: 'Dark chocolate (20g)\n15g almonds' },
  { id: 'sm-d7-d', meal_plan_id: 'demo-structured-001', day_number: 7, category_id: 'cat-5-dinner', meal_description: 'White bean soup (250g)\n2 slices crusty bread\nOlives and feta' }
];

// Flexible plan options
export const DEMO_FLEXIBLE_OPTIONS = [
  // Breakfast options
  { id: 'fo-b-1', meal_plan_id: 'demo-flexible-001', category_id: 'cat-1-breakfast', option_text: 'Overnight oats with almond milk, banana, and cinnamon', display_order: 1, calories: 350, protein_grams: 12, carbs_grams: 55, fats_grams: 10 },
  { id: 'fo-b-2', meal_plan_id: 'demo-flexible-001', category_id: 'cat-1-breakfast', option_text: '2 scrambled eggs with vegetables and feta\n1 slice whole wheat bread', display_order: 2, calories: 380, protein_grams: 22, carbs_grams: 25, fats_grams: 20 },
  { id: 'fo-b-3', meal_plan_id: 'demo-flexible-001', category_id: 'cat-1-breakfast', option_text: 'Greek yogurt (200g) with granola (40g) and berries', display_order: 3, calories: 340, protein_grams: 18, carbs_grams: 45, fats_grams: 12 },
  { id: 'fo-b-4', meal_plan_id: 'demo-flexible-001', category_id: 'cat-1-breakfast', option_text: 'Avocado toast (1/2 avocado) with 2 poached eggs', display_order: 4, calories: 400, protein_grams: 18, carbs_grams: 30, fats_grams: 25 },

  // Morning snack options
  { id: 'fo-ms-1', meal_plan_id: 'demo-flexible-001', category_id: 'cat-2-morning-snack', option_text: '1 apple + 20g almonds', display_order: 1, calories: 200, protein_grams: 5, carbs_grams: 25, fats_grams: 12 },
  { id: 'fo-ms-2', meal_plan_id: 'demo-flexible-001', category_id: 'cat-2-morning-snack', option_text: 'Greek yogurt (150g) + 1 tbsp honey', display_order: 2, calories: 180, protein_grams: 10, carbs_grams: 25, fats_grams: 5 },
  { id: 'fo-ms-3', meal_plan_id: 'demo-flexible-001', category_id: 'cat-2-morning-snack', option_text: '1 banana + 15g peanut butter', display_order: 3, calories: 220, protein_grams: 6, carbs_grams: 30, fats_grams: 10 },
  { id: 'fo-ms-4', meal_plan_id: 'demo-flexible-001', category_id: 'cat-2-morning-snack', option_text: 'Trail mix (40g)', display_order: 4, calories: 200, protein_grams: 5, carbs_grams: 20, fats_grams: 12 },

  // Lunch options
  { id: 'fo-l-1', meal_plan_id: 'demo-flexible-001', category_id: 'cat-3-lunch', option_text: 'Grilled chicken (150g) + roasted potatoes (200g)\nSalad with 1 tbsp olive oil', display_order: 1, calories: 550, protein_grams: 45, carbs_grams: 45, fats_grams: 18 },
  { id: 'fo-l-2', meal_plan_id: 'demo-flexible-001', category_id: 'cat-3-lunch', option_text: 'Salmon (150g) + brown rice (100g cooked)\nSteamed broccoli', display_order: 2, calories: 520, protein_grams: 40, carbs_grams: 40, fats_grams: 20 },
  { id: 'fo-l-3', meal_plan_id: 'demo-flexible-001', category_id: 'cat-3-lunch', option_text: 'Lentil soup (300g) + 2 slices bread\nFeta cheese (30g)', display_order: 3, calories: 480, protein_grams: 22, carbs_grams: 65, fats_grams: 14 },
  { id: 'fo-l-4', meal_plan_id: 'demo-flexible-001', category_id: 'cat-3-lunch', option_text: 'Turkey breast (150g) + quinoa (100g cooked)\nMixed green salad', display_order: 4, calories: 490, protein_grams: 42, carbs_grams: 38, fats_grams: 16 },
  { id: 'fo-l-5', meal_plan_id: 'demo-flexible-001', category_id: 'cat-3-lunch', option_text: 'Greek moussaka (200g)\nGreek salad', display_order: 5, calories: 550, protein_grams: 25, carbs_grams: 40, fats_grams: 32 },

  // Afternoon snack options
  { id: 'fo-as-1', meal_plan_id: 'demo-flexible-001', category_id: 'cat-4-afternoon-snack', option_text: 'Hummus (50g) + carrot sticks', display_order: 1, calories: 150, protein_grams: 5, carbs_grams: 18, fats_grams: 7 },
  { id: 'fo-as-2', meal_plan_id: 'demo-flexible-001', category_id: 'cat-4-afternoon-snack', option_text: 'Cottage cheese (100g) + 1 pear', display_order: 2, calories: 170, protein_grams: 14, carbs_grams: 22, fats_grams: 3 },
  { id: 'fo-as-3', meal_plan_id: 'demo-flexible-001', category_id: 'cat-4-afternoon-snack', option_text: 'Rice cakes (2) + almond butter (1 tbsp)', display_order: 3, calories: 180, protein_grams: 5, carbs_grams: 20, fats_grams: 10 },
  { id: 'fo-as-4', meal_plan_id: 'demo-flexible-001', category_id: 'cat-4-afternoon-snack', option_text: 'Dark chocolate (25g) + 10g walnuts', display_order: 4, calories: 190, protein_grams: 3, carbs_grams: 18, fats_grams: 14 },

  // Dinner options
  { id: 'fo-d-1', meal_plan_id: 'demo-flexible-001', category_id: 'cat-5-dinner', option_text: 'Grilled sea bream (180g)\nRoasted vegetables (200g)\n1 tbsp olive oil', display_order: 1, calories: 450, protein_grams: 40, carbs_grams: 20, fats_grams: 25 },
  { id: 'fo-d-2', meal_plan_id: 'demo-flexible-001', category_id: 'cat-5-dinner', option_text: 'Beef steak (150g)\nMashed sweet potato (150g)\nGreen beans', display_order: 2, calories: 500, protein_grams: 38, carbs_grams: 35, fats_grams: 22 },
  { id: 'fo-d-3', meal_plan_id: 'demo-flexible-001', category_id: 'cat-5-dinner', option_text: 'Shrimp (150g) + whole wheat pasta (80g dry)\nTomato sauce with basil', display_order: 3, calories: 480, protein_grams: 35, carbs_grams: 55, fats_grams: 12 },
  { id: 'fo-d-4', meal_plan_id: 'demo-flexible-001', category_id: 'cat-5-dinner', option_text: 'White bean soup (250g)\n2 slices crusty bread\nOlives and feta', display_order: 4, calories: 420, protein_grams: 18, carbs_grams: 55, fats_grams: 15 },
  { id: 'fo-d-5', meal_plan_id: 'demo-flexible-001', category_id: 'cat-5-dinner', option_text: 'Grilled chicken breast (150g)\nBulgur pilaf (100g cooked)\nMixed salad', display_order: 5, calories: 460, protein_grams: 42, carbs_grams: 35, fats_grams: 16 }
];

export const DEMO_USER_ROLES = [
  {
    id: 'role-001',
    user_id: 'demo-user-001',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const DEMO_AI_PROMPTS = [
  {
    id: 'prompt-001',
    name: 'Default Mediterranean',
    system_prompt: `You are an AI assistant for a professional nutritionist specializing in Mediterranean diet and holistic nutrition therapy.

RULES:
1. All responses in GREEK
2. Exact measurements: gr (grams), tbsp (tablespoons), tsp (teaspoons)
3. EACH meal MUST be COMPLETE with: protein + carbohydrate + fat + vegetables/fiber
4. Mediterranean diet with Greek ingredients
5. Fruits in numbers (e.g. "1 apple"), NOT in grams

EXAMPLES OF CORRECT MEALS:
- "Omelette: 2 eggs + 30g feta + 2 slices whole wheat bread (60g) + cherry tomatoes + 1 tsp olive oil"
- "Grilled chicken (150g) + roasted potatoes (200g) + salad with 1 tbsp olive oil"
- "Salmon (150g) + rice (80g raw) + broccoli (100g) + 1 tbsp olive oil"

WRONG (incomplete meal):
- "Yogurt with honey" (missing protein/carbohydrate)
- "Salad with chicken" (missing quantities)

RESPOND ONLY WITH VALID JSON.`,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const DEMO_APP_SETTINGS = {
  id: 'settings-001',
  ai_model: 'gpt-4o',
  created_at: '2024-01-01T00:00:00Z'
};
