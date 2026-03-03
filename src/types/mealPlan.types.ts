export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  special_instructions?: string;
  dietary_restrictions?: string[];
  medical_conditions?: string;
  goals?: string;
  food_preferences?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealCategory {
  id: string;
  name: string;
  display_name_greek: string;
  display_order: number;
  created_at: string;
}

export interface MealPlan {
  id: string;
  client_id: string;
  title: string;
  type: 'flexible' | 'structured';
  status: 'draft' | 'active' | 'archived';
  start_date?: string;
  ai_generated: boolean;
  ai_prompt_used?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  share_token: string;
  nutritional_targets?: NutritionalTargets;
}

export interface NutritionalTargets {
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface FlexiblePlanOption {
  id: string;
  meal_plan_id: string;
  category_id: string;
  option_text: string;
  display_order: number;
  created_at: string;
  calories?: number;
  protein_grams?: number;
  carbs_grams?: number;
  fats_grams?: number;
}

export interface StructuredPlanMeal {
  id: string;
  meal_plan_id: string;
  day_number: number;
  category_id: string;
  meal_description: string;
  created_at: string;
}

export interface PlanInstruction {
  id: string;
  meal_plan_id: string;
  instruction_type: string;
  content: string;
  display_order: number;
}

export interface AIGenerationRequest {
  clientName: string;
  planType: 'flexible' | 'structured';
  previousPlan?: MealPlan;
  modifications?: string[];
  dietaryRestrictions?: string[];
  preferences?: string[];
  weekNumber?: number;
}

export interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface FlexibleMealOption {
  text: string;
  nutrition?: MealNutrition;
}

export interface FlexiblePlanCategory {
  categoryName: string;
  options: (string | FlexibleMealOption)[];
}

export interface StructuredPlanDay {
  day: number;
  meals: {
    [category: string]: string;
  };
}

export interface AIGenerationResponse {
  success: boolean;
  mealPlan?: {
    flexible?: FlexiblePlanCategory[];
    structured?: StructuredPlanDay[];
    instructions?: string[];
  };
  reasoning?: string;
  error?: string;
}