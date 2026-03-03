import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeBaseStats {
  totalMeals: number;
  totalPlans: number;
  totalClients: number;
}

export class KnowledgeBaseService {
  /**
   * Get statistics about the knowledge base for display in Settings
   */
  static async getStats(): Promise<KnowledgeBaseStats> {
    try {
      const [flexibleResult, structuredResult, plansResult, clientsResult] = await Promise.all([
        supabase.from('flexible_plan_options').select('id', { count: 'exact', head: true }),
        supabase.from('structured_plan_meals').select('id', { count: 'exact', head: true }),
        supabase.from('meal_plans').select('id', { count: 'exact', head: true }),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalMeals: (flexibleResult.count || 0) + (structuredResult.count || 0),
        totalPlans: plansResult.count || 0,
        totalClients: clientsResult.count || 0,
      };
    } catch (error) {
      console.error('Error fetching knowledge base stats:', error);
      return {
        totalMeals: 0,
        totalPlans: 0,
        totalClients: 0,
      };
    }
  }
}
