import { supabase } from '@/integrations/supabase/client';

export interface Recipe {
  id: string;
  text: string;
  category: string;
  categoryGreek: string;
  clientName: string;
  planTitle: string;
  type: 'flexible' | 'structured';
  dayNumber?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface RecipeFilters {
  category?: string;
  search?: string;
}

export interface RecipeMeta {
  total: number;
  categories: Array<{ name: string; greekName: string; count: number }>;
}

const CATEGORY_GREEK: Record<string, string> = {
  breakfast: 'Πρωινό',
  morning_snack: 'Δεκατιανό',
  lunch: 'Μεσημεριανό',
  afternoon_snack: 'Απογευματινό',
  dinner: 'Βραδινό',
};

export class RecipeService {
  /**
   * Get all recipes (meals) from the database with optional filtering
   */
  static async getRecipes(filters?: RecipeFilters): Promise<{
    recipes: Recipe[];
    meta: RecipeMeta;
  }> {
    const recipes: Recipe[] = [];

    // Fetch flexible plan options
    const { data: flexibleOptions, error: flexError } = await supabase
      .from('flexible_plan_options')
      .select(`
        id,
        option_text,
        calories,
        protein_grams,
        carbs_grams,
        fats_grams,
        meal_categories:category_id(name, display_name_greek),
        meal_plans:meal_plan_id(title, clients:client_id(name))
      `)
      .order('created_at', { ascending: false });

    if (flexError) {
      console.error('Error fetching flexible options:', flexError);
      throw new Error('Σφάλμα κατά τη φόρτωση των ευέλικτων επιλογών');
    }

    // Fetch structured plan meals
    const { data: structuredMeals, error: structError } = await supabase
      .from('structured_plan_meals')
      .select(`
        id,
        meal_description,
        day_number,
        meal_categories:category_id(name, display_name_greek),
        meal_plans:meal_plan_id(title, clients:client_id(name))
      `)
      .order('day_number', { ascending: true });

    if (structError) {
      console.error('Error fetching structured meals:', structError);
      throw new Error('Σφάλμα κατά τη φόρτωση των δομημένων γευμάτων');
    }

    // Process flexible options
    if (flexibleOptions) {
      for (const option of flexibleOptions) {
        const mealCat = option.meal_categories as { name: string; display_name_greek: string } | null;
        const mealPlan = option.meal_plans as { title: string; clients: { name: string } | null } | null;

        recipes.push({
          id: option.id,
          text: option.option_text,
          category: mealCat?.name || 'unknown',
          categoryGreek: mealCat?.display_name_greek || mealCat?.name || 'unknown',
          clientName: mealPlan?.clients?.name || 'Άγνωστος',
          planTitle: mealPlan?.title || '',
          type: 'flexible',
          calories: option.calories || undefined,
          protein: option.protein_grams || undefined,
          carbs: option.carbs_grams || undefined,
          fats: option.fats_grams || undefined,
        });
      }
    }

    // Process structured meals
    if (structuredMeals) {
      for (const meal of structuredMeals) {
        const mealCat = meal.meal_categories as { name: string; display_name_greek: string } | null;
        const mealPlan = meal.meal_plans as { title: string; clients: { name: string } | null } | null;

        recipes.push({
          id: meal.id,
          text: meal.meal_description,
          category: mealCat?.name || 'unknown',
          categoryGreek: mealCat?.display_name_greek || mealCat?.name || 'unknown',
          clientName: mealPlan?.clients?.name || 'Άγνωστος',
          planTitle: mealPlan?.title || '',
          type: 'structured',
          dayNumber: meal.day_number,
        });
      }
    }

    // Apply filters
    let filteredRecipes = recipes;

    if (filters?.category && filters.category !== 'all') {
      filteredRecipes = filteredRecipes.filter(r => r.category === filters.category);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(r =>
        r.text.toLowerCase().includes(searchLower) ||
        r.clientName.toLowerCase().includes(searchLower)
      );
    }

    // Calculate category counts
    const categoryCounts: Record<string, number> = {};
    for (const recipe of recipes) {
      categoryCounts[recipe.category] = (categoryCounts[recipe.category] || 0) + 1;
    }

    const categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        greekName: CATEGORY_GREEK[name] || name,
        count,
      }))
      .sort((a, b) => {
        const order = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });

    return {
      recipes: filteredRecipes,
      meta: {
        total: filteredRecipes.length,
        categories,
      },
    };
  }

  /**
   * Get unique recipe texts (deduplicated)
   */
  static async getUniqueRecipes(filters?: RecipeFilters): Promise<{
    recipes: Recipe[];
    meta: RecipeMeta;
  }> {
    const { recipes, meta } = await this.getRecipes(filters);

    // Deduplicate by text (keep first occurrence)
    const seen = new Set<string>();
    const uniqueRecipes = recipes.filter(recipe => {
      const normalized = recipe.text.toLowerCase().trim();
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });

    return {
      recipes: uniqueRecipes,
      meta: {
        ...meta,
        total: uniqueRecipes.length,
      },
    };
  }
}
