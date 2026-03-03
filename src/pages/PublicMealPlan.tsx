import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar, User, Clock, Utensils, AlertCircle, ChefHat, Coffee, Apple, Soup, Cookie, Moon, Leaf, Droplets, Scale, Info, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { MealPlan, MealCategory, FlexiblePlanOption, StructuredPlanMeal, PlanInstruction, Client } from '@/types/mealPlan.types';
import logo from '@/assets/logo.svg';

const PublicMealPlan = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [categories, setCategories] = useState<MealCategory[]>([]);
  const [flexibleOptions, setFlexibleOptions] = useState<FlexiblePlanOption[]>([]);
  const [structuredMeals, setStructuredMeals] = useState<StructuredPlanMeal[]>([]);
  const [instructions, setInstructions] = useState<PlanInstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareToken) {
      fetchMealPlan();
    }
  }, [shareToken]);

  const fetchMealPlan = async () => {
    try {
      // Fetch meal plan using share token
      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('share_token', shareToken)
        .single();

      if (planError) {
        if (planError.code === 'PGRST116') {
          setError('Meal plan not found');
        } else {
          throw planError;
        }
        return;
      }

      setMealPlan(planData as MealPlan);

      // Fetch client info
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', planData.client_id)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Fetch meal categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('meal_categories')
        .select('*')
        .order('display_order');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch plan content based on type
      if (planData.type === 'flexible') {
        const { data: optionsData, error: optionsError } = await supabase
          .from('flexible_plan_options')
          .select('*')
          .eq('meal_plan_id', planData.id)
          .order('display_order');

        if (optionsError) throw optionsError;
        setFlexibleOptions(optionsData || []);
      } else {
        const { data: mealsData, error: mealsError } = await supabase
          .from('structured_plan_meals')
          .select('*')
          .eq('meal_plan_id', planData.id)
          .order('day_number, category_id');

        if (mealsError) throw mealsError;
        setStructuredMeals((mealsData || []) as any);
      }

      // Fetch instructions
      const { data: instructionsData, error: instructionsError } = await supabase
        .from('plan_instructions')
        .select('*')
        .eq('meal_plan_id', planData.id)
        .order('display_order');

      if (instructionsError) throw instructionsError;
      setInstructions(instructionsData || []);

    } catch (error) {
      console.error('Error fetching meal plan:', error);
      setError('Error loading meal plan');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayNumber - 1] || `Day ${dayNumber}`;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.display_name_greek || category?.name || 'Unknown category';
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('πρωινό') || name.includes('breakfast')) return Coffee;
    if (name.includes('snack') || name.includes('δεκατιανό') || name.includes('απογευματινό')) return Apple;
    if (name.includes('μεσημεριανό') || name.includes('lunch')) return Soup;
    if (name.includes('δείπνο') || name.includes('βραδινό') || name.includes('dinner')) return Moon;
    return Utensils;
  };

  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('πρωινό') || name.includes('breakfast')) return 'from-orange-50 to-orange-100 border-orange-200';
    if (name.includes('snack') || name.includes('δεκατιανό') || name.includes('απογευματινό')) return 'from-green-50 to-green-100 border-green-200';
    if (name.includes('μεσημεριανό') || name.includes('lunch')) return 'from-blue-50 to-blue-100 border-blue-200';
    if (name.includes('δείπνο') || name.includes('βραδινό') || name.includes('dinner')) return 'from-purple-50 to-purple-100 border-purple-200';
    return 'from-gray-50 to-gray-100 border-gray-200';
  };

  const getMealTimeOrder = (categoryName: string): number => {
    const name = categoryName.toLowerCase();
    if (name.includes('πρωινό') || name.includes('breakfast')) return 1;
    if (name.includes('δεκατιανό') || name.includes('snack') || name.includes('δεκατιανό')) return 2;
    if (name.includes('μεσημεριανό') || name.includes('lunch')) return 3;
    if (name.includes('απογευματινό') || name.includes('afternoon')) return 4;
    if (name.includes('δείπνο') || name.includes('βραδινό') || name.includes('dinner')) return 5;
    return 6;
  };

  const groupFlexibleOptionsByCategory = () => {
    const grouped: { [categoryId: string]: FlexiblePlanOption[] } = {};
    flexibleOptions.forEach(option => {
      if (!grouped[option.category_id]) {
        grouped[option.category_id] = [];
      }
      grouped[option.category_id].push(option);
    });

    Object.keys(grouped).forEach(categoryId => {
      grouped[categoryId].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    });

    return grouped;
  };

  const getSortedCategoriesForFlexible = () => {
    const usedCategoryIds = [...new Set(flexibleOptions.map(option => option.category_id))];
    const usedCategories = categories.filter(cat => usedCategoryIds.includes(cat.id));

    return usedCategories.sort((a, b) => {
      const timeOrderA = getMealTimeOrder(a.display_name_greek || a.name);
      const timeOrderB = getMealTimeOrder(b.display_name_greek || b.name);

      if (timeOrderA !== timeOrderB) {
        return timeOrderA - timeOrderB;
      }

      return (a.display_order || 0) - (b.display_order || 0);
    });
  };

  const groupStructuredMealsByDay = () => {
    const grouped: { [day: number]: StructuredPlanMeal[] } = {};
    structuredMeals.forEach(meal => {
      if (!grouped[meal.day_number]) {
        grouped[meal.day_number] = [];
      }
      grouped[meal.day_number].push(meal);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-accent/10">
        <div className="text-center">
          <img src={logo} alt="Meal Planner" className="h-16 w-auto mx-auto mb-4" />
          <p className="text-muted-foreground">Loading meal plan...</p>
        </div>
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-accent/10">
        <div className="text-center max-w-md">
          <img src={logo} alt="Meal Planner" className="h-16 w-auto mx-auto mb-4" />
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print-specific styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            .no-print { display: none !important; }
            .print-content {
              font-size: 11pt !important;
              line-height: 1.3 !important;
              color: #000 !important;
            }
            .print-header {
              background: #f8f9fa !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              padding: 8pt 0 !important;
              margin-bottom: 12pt !important;
            }
            .print-logo {
              height: 30px !important;
              width: auto !important;
            }
            @page {
              margin: 1in !important;
              size: A4 !important;
            }
          }
        `
      }} />

      {/* Print Action Bar */}
      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={handlePrint}
          className="bg-[hsl(var(--brand-pink))] hover:bg-[hsl(var(--brand-pink)/0.9)] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Printer className="h-5 w-5" />
          Print
        </button>
      </div>

      <div className="print-content">
        {/* Header */}
        <header className="bg-[#8BC49A] print:bg-white print:border-b-4 print:border-[#4D4D4A] relative overflow-hidden print-header">
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="relative max-w-6xl mx-auto px-8 py-8 print:px-4 print:py-6">
            <div className="mb-6 print:mb-4">
              <img src={logo} alt="Meal Planner" className="h-16 md:h-20 w-auto print:h-10 print-logo filter drop-shadow-lg" />
            </div>

            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white print:text-gray-900 mb-2 tracking-wide">
                MEAL PLANNER
              </h1>
              <p className="text-xl font-semibold text-white/90 print:text-gray-700 mb-4 tracking-wide">
                Personalized Nutrition Plan
              </p>

              <div className="h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent print:via-gray-400 mx-auto w-2/3"></div>
            </div>

            {/* Client Info Card */}
            <div className="mt-8 bg-white/95 backdrop-blur-sm print:bg-gray-50 rounded-xl shadow-2xl print:shadow-none border border-white/30 print:border-2 print:border-gray-300">
              <div className="p-6 print:p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4 text-center">
                  <div className="group">
                    <div className="flex items-center justify-center gap-2 text-[#4D4D4A] mb-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-bold uppercase tracking-wide">NAME</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900 group-hover:text-[#E18CB7] transition-colors">
                      {client?.name}
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex items-center justify-center gap-2 text-[#4D4D4A] mb-2">
                      <ChefHat className="h-4 w-4" />
                      <span className="text-sm font-bold uppercase tracking-wide">TYPE</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900 group-hover:text-[#E18CB7] transition-colors">
                      {mealPlan.type === 'flexible' ? 'Flexible Plan' : 'Structured Plan'}
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex items-center justify-center gap-2 text-[#4D4D4A] mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-bold uppercase tracking-wide">START DATE</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900 group-hover:text-[#E18CB7] transition-colors">
                      {mealPlan.start_date
                        ? format(new Date(mealPlan.start_date), 'dd/MM/yyyy', { locale: el })
                        : format(new Date(mealPlan.created_at), 'dd/MM/yyyy', { locale: el })}
                    </div>
                  </div>
                </div>

                {mealPlan.nutritional_targets && ((mealPlan.nutritional_targets as any).protein || (mealPlan.nutritional_targets as any).carbs || (mealPlan.nutritional_targets as any).fats) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-[#4D4D4A] mb-3">
                      <Scale className="h-4 w-4" />
                      <span className="text-sm font-bold uppercase tracking-wide">MACROS</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {(mealPlan.nutritional_targets as any).protein && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Protein:</span>
                          <span className="text-gray-900 font-bold">{(mealPlan.nutritional_targets as any).protein}g</span>
                        </div>
                      )}
                      {(mealPlan.nutritional_targets as any).carbs && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Carbs:</span>
                          <span className="text-gray-900 font-bold">{(mealPlan.nutritional_targets as any).carbs}g</span>
                        </div>
                      )}
                      {(mealPlan.nutritional_targets as any).fats && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Fats:</span>
                          <span className="text-gray-900 font-bold">{(mealPlan.nutritional_targets as any).fats}g</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {mealPlan.notes && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-[#4D4D4A] mb-3">
                      <Info className="h-4 w-4" />
                      <span className="text-sm font-bold uppercase tracking-wide">NOTES</span>
                    </div>
                    <div className="text-base leading-relaxed text-gray-800 bg-gradient-to-r from-[#AEDBC0]/20 to-[#E18CB7]/20 p-4 rounded-lg border-l-4 border-[#AEDBC0]">
                      {mealPlan.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-8 py-12 print:px-4 print:py-8">
          {/* Main Content */}
          <div className="space-y-10 print:space-y-8">
            {mealPlan.type === 'flexible' ? (
              // Flexible Plan Layout
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-[#4D4D4A] mb-4 relative">
                    MEAL OPTIONS
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-[#AEDBC0]/50 to-transparent"></div>
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Choose from the options below for each meal category according to your preferences
                  </p>
                </div>

                {getSortedCategoriesForFlexible().map((category) => {
                  const options = groupFlexibleOptionsByCategory()[category.id] || [];
                  if (!options.length) return null;

                  const categoryName = category.display_name_greek || category.name;
                  const IconComponent = getCategoryIcon(categoryName);
                  const name = categoryName.toLowerCase();
                  const isBreakfast = name.includes('πρωινό') || name.includes('breakfast');
                  const isSnack = name.includes('snack') || name.includes('δεκατιανό') || name.includes('απογευματινό');
                  const isLunch = name.includes('μεσημεριανό') || name.includes('lunch');
                  const isDinner = name.includes('δείπνο') || name.includes('βραδινό') || name.includes('dinner');

                  const badgeBg = isBreakfast ? 'bg-orange-100 text-orange-700' :
                                  isSnack ? 'bg-green-100 text-green-700' :
                                  isLunch ? 'bg-blue-100 text-blue-700' :
                                  isDinner ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700';

                  return (
                    <div key={category.id} className="bg-card rounded-xl border border-border p-6 shadow-sm print:shadow-none">
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2.5 rounded-lg ${badgeBg}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">{categoryName}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {options.map((option, index) => (
                          <div key={option.id} className="group bg-muted/30 hover:bg-muted/50 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border border-transparent hover:border-border">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-7 h-7 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-sm font-semibold">
                                {index + 1}
                              </div>
                              <div className="flex-1 text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
                                {option.option_text}
                              </div>
                            </div>
                            {(option.calories || option.protein_grams || option.carbs_grams || option.fats_grams) && (
                              <div className="nutrition-strip mt-3 pt-3 border-t border-border">
                                {option.calories && (
                                  <span className="nutrition-item">
                                    <span className="font-medium">{option.calories}</span> kcal
                                  </span>
                                )}
                                {option.protein_grams && (
                                  <span className="nutrition-item">
                                    <span className="font-medium">{option.protein_grams}g</span> P
                                  </span>
                                )}
                                {option.carbs_grams && (
                                  <span className="nutrition-item">
                                    <span className="font-medium">{option.carbs_grams}g</span> C
                                  </span>
                                )}
                                {option.fats_grams && (
                                  <span className="nutrition-item">
                                    <span className="font-medium">{option.fats_grams}g</span> F
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Structured Plan Layout
              <div className="structured-meal-plan space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-[#4D4D4A] mb-4 relative">
                    WEEKLY PLAN
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-[#AEDBC0]/50 to-transparent"></div>
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Follow this plan for each day of the week
                  </p>
                </div>

                {/* Mobile Accordion View */}
                <div className="block md:hidden space-y-4 mb-8">
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(groupStructuredMealsByDay()).map(([day, meals]) => (
                      <AccordionItem key={day} value={`day-${day}`} className="border border-gray-200 rounded-lg mb-2">
                        <AccordionTrigger className="px-4 py-3 bg-[#8BC49A]/20 text-[#4D4D4A] font-semibold rounded-t-lg hover:bg-[#8BC49A]/30">
                          {getDayName(parseInt(day))}
                        </AccordionTrigger>
                        <AccordionContent className="p-4 bg-white">
                          <div className="space-y-4">
                            {categories.map(category => {
                              const meal = meals.find(m => m.category_id === category.id);
                              return (
                                <div key={category.id} className="border-l-4 border-[#AEDBC0] pl-4">
                                  <h4 className="font-semibold text-[#4D4D4A] mb-2">
                                    {category.display_name_greek || category.name}
                                  </h4>
                                  <div className="text-sm text-gray-700">
                                    {meal ? (
                                      <div className="whitespace-pre-line">{meal.meal_description}</div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-card rounded-xl border border-border shadow-sm print:shadow-none overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-secondary text-secondary-foreground">
                        <th className="px-4 py-3 text-left font-semibold text-sm">DAY</th>
                        {categories.map(category => (
                          <th key={category.id} className="px-4 py-3 text-center font-semibold text-sm">
                            {category.display_name_greek || category.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(groupStructuredMealsByDay()).map(([day, meals], rowIndex) => (
                        <tr key={day} className={`${rowIndex % 2 === 0 ? '' : 'bg-[hsl(var(--brand-light))]'} hover:bg-[hsl(var(--brand-pink)/0.05)] transition-colors duration-200`}>
                          <td className="px-4 py-4 font-semibold text-sm border-b border-border bg-secondary/30">
                            {getDayName(parseInt(day))}
                          </td>
                          {categories.map(category => {
                            const meal = meals.find(m => m.category_id === category.id);
                            return (
                              <td key={category.id} className="px-4 py-4 text-sm leading-relaxed border-b border-border">
                                {meal ? (
                                  <div className="whitespace-pre-line text-foreground/80">{meal.meal_description}</div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-16 print:mt-12 pt-8">
            <div className="bg-gradient-to-r from-[#4D4D4A] to-gray-800 text-white rounded-2xl p-8 print:bg-gray-100 print:text-gray-800 shadow-2xl print:shadow-none">
              <div className="text-center space-y-4">
                <div className="flex flex-col items-center justify-center mb-6">
                  <img src={logo} alt="Meal Planner" className="h-12 w-auto mb-4 filter brightness-0 invert print:filter-none" />
                  <h3 className="text-2xl font-bold">Meal Planner</h3>
                  <p className="text-lg">AI-Powered Nutrition Planning</p>
                </div>

                <div className="border-t border-white/30 print:border-gray-300 pt-4 mt-6 space-y-2">
                  <p className="text-sm text-white/95 max-w-3xl mx-auto leading-relaxed print:text-gray-700">
                    This meal plan has been designed specifically for you based on your individual needs and preferences.
                    Please follow the instructions for optimal results.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Created: {format(new Date(mealPlan.created_at), 'dd/MM/yyyy', { locale: el })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PublicMealPlan;
