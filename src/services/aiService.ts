import { supabase } from '@/integrations/supabase/client';
import { AIGenerationRequest, AIGenerationResponse } from '@/types/mealPlan.types';

export class AIService {
  static async generateMealPlan(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      console.log('Sending AI generation request:', request);

      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: request
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate meal plan');
      }

      console.log('AI generation response:', data);
      return data as AIGenerationResponse;

    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static handleAIError(error: any): string {
    if (error?.message?.includes('rate_limit_exceeded')) {
      return 'Το όριο χρήσης του AI έχει ξεπεραστεί. Παρακαλώ δοκιμάστε αργότερα.';
    }
    
    if (error?.message?.includes('invalid_api_key')) {
      return 'Πρόβλημα με την εξουσιοδότηση AI. Επικοινωνήστε με την υποστήριξη.';
    }

    if (error?.message?.includes('context_length_exceeded')) {
      return 'Το αίτημα είναι πολύ μεγάλο. Παρακαλώ μειώστε τις πληροφορίες.';
    }
    
    return 'Παρουσιάστηκε πρόβλημα με τη δημιουργία του προγράμματος. Δοκιμάστε ξανά.';
  }
}