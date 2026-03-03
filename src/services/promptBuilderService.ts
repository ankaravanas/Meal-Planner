import { supabase } from '@/integrations/supabase/client';

// CRITICAL: These must match database exactly
const REQUIRED_CATEGORIES = [
  'Πρωινό',
  'Δεκατιανό/Snack',
  'Μεσημεριανό',
  'Απογευματινό',
  'Βραδινό'
] as const;

export interface BodyMeasurement {
  height_cm?: number;
  weight_kg?: number;
  measured_at?: string;
}

export interface ClientContext {
  name: string;
  special_instructions?: string;
  dietary_restrictions?: string[];
  medical_conditions?: string;
  goals?: string;
  food_preferences?: string;
  body_measurements?: BodyMeasurement;
  history_notes?: Array<{
    note_date: string;
    category: string;
    content: string;
  }>;
}

export interface PreviousPlanContext {
  title: string;
  type: 'flexible' | 'structured';
  content: any;
  feedback?: {
    what_worked?: string;
    what_didnt_work?: string;
    progress_notes?: string;
  };
}

export interface ModificationInstructions {
  text: string;
  quickActions: string[];
}

export interface NutritionalTargets {
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface AssembledPrompt {
  systemPrompt: string;
  userPrompt: string;
  context: {
    client: ClientContext;
    previousPlan?: PreviousPlanContext;
    modifications?: ModificationInstructions;
  };
  estimatedTokens: number;
}

export class PromptBuilderService {
  // Rough token estimation (4 characters ≈ 1 token)
  static estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Fetch sample meals from the database to use as examples in the prompt.
   * This helps the AI understand the expected format and style.
   */
  static async getSampleMeals(samplesPerCategory: number = 5): Promise<Record<string, string[]>> {
    const result: Record<string, string[]> = {
      'Πρωινό': [],
      'Δεκατιανό/Snack': [],
      'Μεσημεριανό': [],
      'Απογευματινό': [],
      'Βραδινό': []
    };

    try {
      const { data: flexMeals, error } = await supabase
        .from('flexible_plan_options')
        .select(`
          option_text,
          meal_categories:category_id(display_name_greek)
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error || !flexMeals) {
        console.warn('Failed to fetch sample meals:', error);
        return result;
      }

      const seen = new Set<string>();

      for (const meal of flexMeals) {
        const cat = (meal.meal_categories as any)?.display_name_greek;
        const text = meal.option_text?.trim();

        if (!cat || !text || !result[cat]) continue;
        if (result[cat].length >= samplesPerCategory) continue;

        // Deduplicate by normalized text
        const normalized = text.toLowerCase();
        if (seen.has(normalized)) continue;
        seen.add(normalized);

        result[cat].push(text);
      }

      console.log('Loaded sample meals:', Object.values(result).flat().length);
    } catch (e) {
      console.warn('Error fetching sample meals:', e);
    }

    return result;
  }

  /**
   * Format sample meals into a prompt-friendly string.
   */
  static formatMealExamples(meals: Record<string, string[]>): string {
    const hasAnyMeals = Object.values(meals).some(arr => arr.length > 0);
    if (!hasAnyMeals) return '';

    let text = `\n---\nΠΑΡΑΔΕΙΓΜΑΤΑ ΥΠΑΡΧΟΝΤΩΝ ΓΕΥΜΑΤΩΝ (χρησιμοποίησε παρόμοιο στυλ και format):\n\n`;

    for (const category of REQUIRED_CATEGORIES) {
      const options = meals[category];
      if (options && options.length > 0) {
        text += `**${category}:**\n`;
        options.forEach((opt, i) => {
          text += `  ${i + 1}. ${opt}\n`;
        });
        text += '\n';
      }
    }

    text += `ΣΗΜΑΝΤΙΚΟ: Δημιούργησε γεύματα με ΠΑΡΟΜΟΙΟ στυλ - συγκεκριμένες ποσότητες σε γραμμάρια, πλήρη γεύματα με όλα τα macros.\n`;

    return text;
  }

  static async getClientHistory(clientId: string): Promise<Array<{note_date: string; category: string; content: string}>> {
    const { data } = await supabase
      .from('client_history_notes')
      .select('note_date, category, content')
      .eq('client_id', clientId)
      .order('note_date', { ascending: false })
      .limit(5);
    return data || [];
  }

  static async getActiveSystemPrompt(): Promise<string> {
    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .select('system_prompt')
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Fallback to default prompt
      return `You are an AI assistant for a professional nutritionist specializing in Mediterranean diet and holistic nutrition therapy.

ΚΑΝΟΝΕΣ:
1. Όλες οι απαντήσεις στα ΕΛΛΗΝΙΚΑ
2. Ακριβείς μετρήσεις: γρ (γραμμάρια), κς (κουταλιές σούπας), κγ (κουταλάκια γλυκού)
3. ΚΑΘΕ γεύμα ΠΡΕΠΕΙ να είναι ΠΛΗΡΕΣ με: πρωτεΐνη + υδατάνθρακα + λίπος + λαχανικά/ίνες
4. Μεσογειακή διατροφή με ελληνικά συστατικά
5. Τα φρούτα σε αριθμό (π.χ. "1 μήλο"), ΟΧΙ σε γραμμάρια

ΠΑΡΑΔΕΙΓΜΑΤΑ ΣΩΣΤΩΝ ΓΕΥΜΑΤΩΝ:
- "Ομελέτα: 2 αυγά + 30γρ φέτα + 2 φέτες ψωμί ολικής (60γρ) + ντοματίνια + 1 κγ ελαιόλαδο"
- "Κοτόπουλο ψητό (150γρ) + πατάτες φούρνου (200γρ) + σαλάτα με 1 κς ελαιόλαδο"
- "Σολομός (150γρ) + ρύζι (80γρ ωμό) + μπρόκολο (100γρ) + 1 κς ελαιόλαδο"

ΛΑΘΟΣ (ελλιπές γεύμα):
- "Γιαούρτι με μέλι" (λείπει πρωτεΐνη/υδατάνθρακας)
- "Σαλάτα με κοτόπουλο" (λείπουν ποσότητες)

ΑΠΑΝΤΗΣΕ ΜΟΝΟ ΜΕ ΕΓΚΥΡΟ JSON.`;
    }

    return data.system_prompt;
  }

  static formatClientContext(client: ClientContext): string {
    let context = `ΠΛΗΡΟΦΟΡΙΕΣ ΠΕΛΑΤΗ:\n`;
    context += `Όνομα: ${client.name}\n`;

    // Body measurements
    if (client.body_measurements) {
      const { height_cm, weight_kg } = client.body_measurements;
      if (height_cm || weight_kg) {
        context += `\nΣωματικές Μετρήσεις:\n`;
        if (height_cm) context += `- Ύψος: ${height_cm} cm\n`;
        if (weight_kg) context += `- Βάρος: ${weight_kg} kg\n`;
        if (height_cm && weight_kg) {
          const bmi = (weight_kg / ((height_cm / 100) ** 2)).toFixed(1);
          context += `- BMI: ${bmi}\n`;
        }
      }
    }

    if (client.dietary_restrictions && client.dietary_restrictions.length > 0) {
      context += `\nΔιατροφικοί Περιορισμοί: ${client.dietary_restrictions.join(', ')}\n`;
    }

    if (client.medical_conditions) {
      context += `\nΙατρικές Καταστάσεις:\n${client.medical_conditions}\n`;
    }

    if (client.goals) {
      context += `\nΣτόχοι:\n${client.goals}\n`;
    }

    if (client.food_preferences) {
      context += `\nΠροτιμήσεις Τροφίμων:\n${client.food_preferences}\n`;
    }

    if (client.history_notes && client.history_notes.length > 0) {
      context += `\n--- ΙΣΤΟΡΙΚΟ ΠΕΛΑΤΗ ---\n`;
      client.history_notes.forEach(note => {
        context += `[${note.note_date}] ${note.content}\n\n`;
      });
    }

    return context;
  }

  static formatPreviousPlan(plan: PreviousPlanContext): string {
    let context = `\n---\nΠΡΟΗΓΟΥΜΕΝΟ ΠΡΟΓΡΑΜΜΑ:\n`;
    context += `Τίτλος: ${plan.title}\n`;
    context += `Τύπος: ${plan.type === 'flexible' ? 'Ελεύθερο' : 'Δομημένο'}\n\n`;

    if (plan.type === 'flexible' && plan.content.flexible) {
      context += `Επιλογές Γευμάτων:\n`;
      plan.content.flexible.forEach((category: any) => {
        context += `\n${category.categoryName}:\n`;
        category.options.forEach((option: string, idx: number) => {
          context += `  ${idx + 1}. ${option}\n`;
        });
      });
    } else if (plan.type === 'structured' && plan.content.structured) {
      context += `Ημερήσια Γεύματα:\n`;
      plan.content.structured.forEach((day: any) => {
        context += `\nΗμέρα ${day.day}:\n`;
        Object.entries(day.meals).forEach(([category, meal]) => {
          context += `  ${category}: ${meal}\n`;
        });
      });
    }

    if (plan.feedback) {
      context += `\n--- ΑΝΑΤΡΟΦΟΔΟΤΗΣΗ ---\n`;
      if (plan.feedback.what_worked) {
        context += `Τι Λειτούργησε Καλά:\n${plan.feedback.what_worked}\n\n`;
      }
      if (plan.feedback.what_didnt_work) {
        context += `Τι Δεν Λειτούργησε:\n${plan.feedback.what_didnt_work}\n\n`;
      }
      if (plan.feedback.progress_notes) {
        context += `Σημειώσεις Προόδου:\n${plan.feedback.progress_notes}\n`;
      }
    }

    return context;
  }

  static formatModifications(modifications: ModificationInstructions): string {
    let context = `\n---\nΑΛΛΑΓΕΣ ΓΙΑ ΑΥΤΗ ΤΗ ΔΙΑΤΡΟΦΗ:\n`;

    if (modifications.quickActions.length > 0) {
      context += `Γρήγορες Ενέργειες: ${modifications.quickActions.join(', ')}\n\n`;
    }

    if (modifications.text) {
      context += `Συγκεκριμένες Οδηγίες:\n${modifications.text}\n`;
    }

    return context;
  }

  static formatNutritionalTargets(targets: NutritionalTargets): string {
    if (!targets.calories && !targets.protein && !targets.carbs && !targets.fats) {
      return '';
    }

    let context = `\n---\nΘΡΕΠΤΙΚΟΙ ΣΤΟΧΟΙ:\n`;

    if (targets.calories) {
      context += `- Ημερήσιες θερμίδες: ${targets.calories} kcal\n`;
    }

    if (targets.protein || targets.carbs || targets.fats) {
      context += `- Μακροθρεπτικά:\n`;
      if (targets.protein) context += `  • Πρωτεΐνες: ${targets.protein}γρ\n`;
      if (targets.carbs) context += `  • Υδατάνθρακες: ${targets.carbs}γρ\n`;
      if (targets.fats) context += `  • Λίπη: ${targets.fats}γρ\n`;
    }

    context += `\nΕξασφάλισε ότι το διατροφικό πρόγραμμα πληροί αυτούς τους στόχους κατά προσέγγιση. `;
    context += `Κατανείμε τις θερμίδες και τα μακροθρεπτικά ομοιόμορφα στα γεύματα της ημέρας.\n`;

    return context;
  }

  static async assemblePrompt(
    client: ClientContext,
    planType: 'flexible' | 'structured',
    previousPlan?: PreviousPlanContext,
    modifications?: ModificationInstructions,
    dietaryRestrictions?: string[],
    nutritionalTargets?: NutritionalTargets
  ): Promise<AssembledPrompt> {
    // Fetch system prompt and sample meals in parallel
    const [systemPrompt, sampleMeals] = await Promise.all([
      this.getActiveSystemPrompt(),
      this.getSampleMeals(5)
    ]);

    let userPrompt = this.formatClientContext(client);

    if (previousPlan) {
      userPrompt += this.formatPreviousPlan(previousPlan);
    }

    if (modifications) {
      userPrompt += this.formatModifications(modifications);
    }

    if (nutritionalTargets) {
      userPrompt += this.formatNutritionalTargets(nutritionalTargets);
    }

    // Add sample meals from database
    userPrompt += this.formatMealExamples(sampleMeals);

    // Add plan type specific instructions with EXACT JSON format
    if (planType === 'flexible') {
      userPrompt += `\n---\nΔΗΜΙΟΥΡΓΙΑ ΕΛΕΥΘΕΡΟΥ ΠΡΟΓΡΑΜΜΑΤΟΣ:\n`;
      userPrompt += `Δημιούργησε ένα ελεύθερο διατροφικό πρόγραμμα 2 εβδομάδων με επιλογές για κάθε γεύμα.\n\n`;

      userPrompt += `ΑΡΙΘΜΟΣ ΕΠΙΛΟΓΩΝ ΑΝΑ ΚΑΤΗΓΟΡΙΑ:\n`;
      userPrompt += `- Πρωινό: 4-6 επιλογές\n`;
      userPrompt += `- Δεκατιανό/Snack: 4-6 επιλογές\n`;
      userPrompt += `- Μεσημεριανό: 5-7 επιλογές\n`;
      userPrompt += `- Απογευματινό: 4-6 επιλογές\n`;
      userPrompt += `- Βραδινό: 5-7 επιλογές\n\n`;

      userPrompt += `ΣΗΜΑΝΤΙΚΟ - ΘΡΕΠΤΙΚΗ ΙΣΟΡΡΟΠΙΑ:\n`;
      userPrompt += `Το κάθε κυρίως γεύμα (πρωινό, μεσημεριανό, βραδινό) να πληροί και τα 3 macros (πρωτεΐνη, υδατάνθρακα και λίπος) και φυτικές ίνες (πχ σαλάτα ή φρούτο όπου ταιριάζει). Η πρωτεΐνη στο πρωινό θα πρέπει να καλύπτει το 20 έως 30% της ημερήσιας πρόσληψης.\n\n`;
      userPrompt += `ΚΡΙΣΙΜΟ - ΙΣΟΔΥΝΑΜΑ MACROS ΑΝΑ ΚΑΤΗΓΟΡΙΑ:\n`;
      userPrompt += `Κάθε επιλογή μέσα στην ίδια κατηγορία γεύματος (π.χ. όλες οι επιλογές πρωινού) πρέπει να έχει παρόμοια θρεπτική αξία (θερμίδες, πρωτεΐνη, υδατάνθρακες, λίπη). Ο πελάτης επιλέγει ΜΙΑ επιλογή για να φάει, όχι όλες μαζί. Άρα οι επιλογές πρέπει να είναι ισοδύναμες διατροφικά.\n\n`;
      userPrompt += `ΟΔΗΓΙΑ ΓΙΑ ΦΡΟΥΤΑ:\n`;
      userPrompt += `Τα φρούτα να μην μετριούνται σε γραμμάρια. Αρκεί ο αριθμός (π.χ. "1 μήλο", "2 μανταρίνια", "1 μπανάνα").\n\n`;
    } else {
      userPrompt += `\n---\nΔΗΜΙΟΥΡΓΙΑ ΔΟΜΗΜΕΝΟΥ ΠΡΟΓΡΑΜΜΑΤΟΣ:\n`;
      userPrompt += `Δημιούργησε ένα δομημένο διατροφικό πρόγραμμα.\n`;
      userPrompt += `Συνολικά 7 ημέρες με συγκεκριμένα γεύματα για κάθε ημέρα (35 γεύματα συνολικά).\n\n`;

      userPrompt += `Κάθε ημέρα πρέπει να περιλαμβάνει:\n`;
      userPrompt += `- Πρωινό\n`;
      userPrompt += `- Δεκατιανό/Snack\n`;
      userPrompt += `- Μεσημεριανό\n`;
      userPrompt += `- Απογευματινό\n`;
      userPrompt += `- Βραδινό\n\n`;

      userPrompt += `ΣΗΜΑΝΤΙΚΟ - ΘΡΕΠΤΙΚΗ ΙΣΟΡΡΟΠΙΑ:\n`;
      userPrompt += `Το κάθε κυρίως γεύμα (πρωινό, μεσημεριανό, βραδινό) να πληροί και τα 3 macros (πρωτεΐνη, υδατάνθρακα και λίπος) και φυτικές ίνες (πχ σαλάτα ή φρούτο όπου ταιριάζει). Η πρωτεΐνη στο πρωινό θα πρέπει να καλύπτει το 20 έως 30% της ημερήσιας πρόσληψης.\n\n`;
      userPrompt += `ΟΔΗΓΙΑ ΓΙΑ ΦΡΟΥΤΑ:\n`;
      userPrompt += `Τα φρούτα να μην μετριούνται σε γραμμάρια. Αρκεί ο αριθμός (π.χ. "1 μήλο", "2 μανταρίνια", "1 μπανάνα").\n\n`;
    }

    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      userPrompt += `ΔΙΑΤΡΟΦΙΚΟΙ ΠΕΡΙΟΡΙΣΜΟΙ ΓΙΑ ΑΥΤΟ ΤΟ ΠΡΟΓΡΑΜΜΑ:\n`;
      userPrompt += dietaryRestrictions.map(r => `- ${r}`).join('\n') + '\n\n';
    }

    // CRITICAL: Add exact JSON format specification
    if (planType === 'flexible') {
      userPrompt += `\nΚΡΙΣΙΜΟ - JSON FORMAT (χρησιμοποίησε ΑΚΡΙΒΩΣ αυτή τη δομή):\n`;
      userPrompt += `{
  "mealPlan": {
    "flexible": [
      {"categoryName": "Πρωινό", "options": ["πλήρες γεύμα 1 με ποσότητες", "πλήρες γεύμα 2 με ποσότητες", "..."]},
      {"categoryName": "Δεκατιανό/Snack", "options": ["σνακ 1", "σνακ 2", "..."]},
      {"categoryName": "Μεσημεριανό", "options": ["πλήρες γεύμα 1", "πλήρες γεύμα 2", "..."]},
      {"categoryName": "Απογευματινό", "options": ["σνακ 1", "σνακ 2", "..."]},
      {"categoryName": "Βραδινό", "options": ["πλήρες γεύμα 1", "πλήρες γεύμα 2", "..."]}
    ]
  },
  "reasoning": "σύντομη εξήγηση"
}\n\n`;
      userPrompt += `ΤΑ categoryName ΠΡΕΠΕΙ ΝΑ ΕΙΝΑΙ ΑΚΡΙΒΩΣ: "Πρωινό", "Δεκατιανό/Snack", "Μεσημεριανό", "Απογευματινό", "Βραδινό"\n`;
    } else {
      userPrompt += `\nΚΡΙΣΙΜΟ - JSON FORMAT (χρησιμοποίησε ΑΚΡΙΒΩΣ αυτή τη δομή):\n`;
      userPrompt += `{
  "mealPlan": {
    "structured": [
      {"day": 1, "meals": {"Πρωινό": "πλήρες γεύμα με ποσότητες", "Δεκατιανό/Snack": "σνακ", "Μεσημεριανό": "πλήρες γεύμα", "Απογευματινό": "σνακ", "Βραδινό": "πλήρες γεύμα"}},
      {"day": 2, "meals": {"Πρωινό": "...", "Δεκατιανό/Snack": "...", "Μεσημεριανό": "...", "Απογευματινό": "...", "Βραδινό": "..."}},
      {"day": 3, "meals": {...}},
      {"day": 4, "meals": {...}},
      {"day": 5, "meals": {...}},
      {"day": 6, "meals": {...}},
      {"day": 7, "meals": {...}}
    ]
  },
  "reasoning": "σύντομη εξήγηση"
}\n\n`;
      userPrompt += `ΤΑ ΚΛΕΙΔΙΑ ΣΤΟ meals ΠΡΕΠΕΙ ΝΑ ΕΙΝΑΙ ΑΚΡΙΒΩΣ: "Πρωινό", "Δεκατιανό/Snack", "Μεσημεριανό", "Απογευματινό", "Βραδινό"\n`;
    }

    userPrompt += `\nΑΠΑΝΤΗΣΕ ΜΟΝΟ ΜΕ ΕΓΚΥΡΟ JSON. ΟΧΙ MARKDOWN, ΟΧΙ BACKTICKS.`;

    const estimatedTokens =
      this.estimateTokens(systemPrompt) +
      this.estimateTokens(userPrompt);

    return {
      systemPrompt,
      userPrompt,
      context: {
        client,
        previousPlan,
        modifications,
      },
      estimatedTokens,
    };
  }
}
