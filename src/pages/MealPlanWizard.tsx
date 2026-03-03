import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, ArrowLeft, Sparkles, Brain, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Client, MealCategory, MealPlan, AIGenerationResponse } from '@/types/mealPlan.types';
import EnhancedAIGenerationModal from '@/components/admin/EnhancedAIGenerationModal';
import logo from '@/assets/logo.svg';
import { DEFAULT_MEAL_PLAN_INSTRUCTIONS } from '@/constants/defaultInstructions';

const MealPlanWizard = () => {
  const [searchParams] = useSearchParams();
  const { id: editId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const isEditMode = !!editId;

  // Form state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [title, setTitle] = useState('');
  const [planType, setPlanType] = useState<'flexible' | 'structured'>('flexible');
  const [startDate, setStartDate] = useState<Date>();
  const [notes, setNotes] = useState('');

  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<MealCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // AI state
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState<AIGenerationResponse | null>(null);

  // Plan content state
  const [flexibleOptions, setFlexibleOptions] = useState<{[categoryId: string]: string[]}>({});
  const [structuredMeals, setStructuredMeals] = useState<{[dayCategory: string]: string}>({});
  const [customInstructions, setCustomInstructions] = useState<string>('');

  useEffect(() => {
    if (isEditMode && editId) {
      fetchEditData();
    } else {
      fetchInitialData();
    }
  }, [isEditMode, editId]);

  useEffect(() => {
    if (!isEditMode) {
      const clientId = searchParams.get('client');
      if (clientId && clients.length > 0) {
        const client = clients.find(c => c.id === clientId);
        if (client) {
          setSelectedClient(client);
          setTitle(`Διατροφικό πρόγραμμα για ${client.name}`);
        }
      }
    }
  }, [searchParams, clients, isEditMode]);

  const fetchEditData = async () => {
    try {
      setLoading(true);

      // Fetch basic data and meal plan
      const [clientsResponse, categoriesResponse, planResponse] = await Promise.all([
        supabase.from('clients').select('*').order('name'),
        supabase.from('meal_categories').select('*').order('display_order'),
        supabase.from('meal_plans').select('*').eq('id', editId).single()
      ]);

      if (clientsResponse.error) throw clientsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;
      if (planResponse.error) throw planResponse.error;

      const plan = planResponse.data;
      const clients = clientsResponse.data || [];
      const categories = categoriesResponse.data || [];

      setClients(clients);
      setCategories(categories);

      // Set form data from existing plan
      setTitle(plan.title);
      setPlanType(plan.type as 'flexible' | 'structured');
      setNotes(plan.notes || '');
      
      if (plan.start_date) {
        setStartDate(new Date(plan.start_date));
      }

      // Find and set the client
      const client = clients.find(c => c.id === plan.client_id);
      setSelectedClient(client || null);

      // Load plan content based on type
      if (plan.type === 'flexible') {
        const { data: options } = await supabase
          .from('flexible_plan_options')
          .select('*')
          .eq('meal_plan_id', plan.id)
          .order('category_id, display_order');

        const optionsMap: {[categoryId: string]: string[]} = {};
        categories.forEach(category => {
          const categoryOptions = options?.filter(o => o.category_id === category.id) || [];
          optionsMap[category.id] = categoryOptions.length > 0 
            ? categoryOptions.map(o => o.option_text)
            : [''];
        });

        setFlexibleOptions(optionsMap);
      } else if (plan.type === 'structured') {
        const { data: meals } = await supabase
          .from('structured_plan_meals')
          .select('*')
          .eq('meal_plan_id', plan.id);

        const mealsMap: {[dayCategory: string]: string} = {};
        meals?.forEach(meal => {
          const key = `${meal.day_number}-${meal.category_id}`;
          mealsMap[key] = meal.meal_description;
        });

        setStructuredMeals(mealsMap);

        // Initialize empty options for flexible mode anyway
        const initialOptions: {[key: string]: string[]} = {};
        categories.forEach(category => {
          initialOptions[category.id] = [''];
        });
        setFlexibleOptions(initialOptions);
      }

      // Load instructions
      const { data: instructionsData } = await supabase
        .from('plan_instructions')
        .select('*')
        .eq('meal_plan_id', plan.id)
        .order('display_order');

      // Only load custom instructions into the custom instructions field
      const customInstruction = instructionsData?.find(inst => inst.instruction_type === 'custom');
      if (customInstruction) {
        setCustomInstructions(customInstruction.content || '');
      }

    } catch (error) {
      console.error('Error fetching edit data:', error);
      toast({
        title: "Σφάλμα φόρτωσης",
        description: "Δεν ήταν δυνατή η φόρτωση του προγράμματος",
        variant: "destructive",
      });
      navigate('/meal-plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [clientsResponse, categoriesResponse] = await Promise.all([
        supabase.from('clients').select('*').order('name'),
        supabase.from('meal_categories').select('*').order('display_order')
      ]);

      if (clientsResponse.error) throw clientsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setClients(clientsResponse.data || []);
      setCategories(categoriesResponse.data || []);

      // Initialize empty options for each category
      const initialOptions: {[key: string]: string[]} = {};
      categoriesResponse.data?.forEach(category => {
        initialOptions[category.id] = [''];
      });
      setFlexibleOptions(initialOptions);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Σφάλμα φόρτωσης",
        description: "Δεν ήταν δυνατή η φόρτωση των δεδομένων",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = (response: AIGenerationResponse) => {
    console.log('handleAIGenerate called with response:', response);
    console.log('Response mealPlan:', response.mealPlan);
    console.log('Available categories:', categories);
    
    if (!categories || categories.length === 0) {
      console.error('Categories not loaded yet!');
      toast({
        title: "Σφάλμα",
        description: "Οι κατηγορίες δεν έχουν φορτωθεί. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
      return;
    }
    
    setAiGeneratedData(response);
    
    if (response.mealPlan?.flexible) {
      console.log('Processing flexible plan with', response.mealPlan.flexible.length, 'categories');
      // Map AI response to flexible options
      const newFlexibleOptions: {[categoryId: string]: string[]} = {};
      
      response.mealPlan.flexible.forEach(category => {
        console.log('Looking for category:', category.categoryName);
        const matchingCategory = categories.find(c => 
          c.display_name_greek === category.categoryName
        );
        console.log('Matched category:', matchingCategory);
        if (matchingCategory) {
          // Extract text from options (handle both string and object formats)
          const textOptions = category.options.map(opt => 
            typeof opt === 'string' ? opt : opt.text
          );
          newFlexibleOptions[matchingCategory.id] = textOptions;
          console.log(`Mapped ${textOptions.length} options to category ${matchingCategory.display_name_greek}`);
        } else {
          console.warn(`No matching category found for: ${category.categoryName}`);
          console.warn('Available display_name_greek values:', categories.map(c => c.display_name_greek));
        }
      });
      
      // Ensure all categories have at least empty array so form renders correctly
      categories.forEach(cat => {
        if (!newFlexibleOptions[cat.id]) {
          newFlexibleOptions[cat.id] = [''];
        }
      });
      
      console.log('Setting flexible options:', newFlexibleOptions);
      console.log('Total options set:', Object.keys(newFlexibleOptions).length);
      setFlexibleOptions(newFlexibleOptions);
      setPlanType('flexible');
    }
    
    if (response.mealPlan?.structured) {
      console.log('Processing structured plan');
      // Map AI response to structured meals
      const newStructuredMeals: {[dayCategory: string]: string} = {};
      
      response.mealPlan.structured.forEach(dayData => {
        Object.entries(dayData.meals).forEach(([categoryName, mealDescription]) => {
          const matchingCategory = categories.find(c => 
            c.display_name_greek === categoryName
          );
          if (matchingCategory) {
            const key = `${dayData.day}-${matchingCategory.id}`;
            newStructuredMeals[key] = mealDescription;
          }
        });
      });
      
      setStructuredMeals(newStructuredMeals);
      setPlanType('structured');
    }

    setShowAIModal(false);
    
    toast({
      title: "AI δημιουργία επιτυχής!",
      description: "Μπορείτε να επεξεργαστείτε το πρόγραμμα πριν το αποθηκεύσετε",
    });
  };

  const addFlexibleOption = (categoryId: string) => {
    setFlexibleOptions(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), '']
    }));
  };

  const updateFlexibleOption = (categoryId: string, index: number, value: string) => {
    setFlexibleOptions(prev => ({
      ...prev,
      [categoryId]: prev[categoryId]?.map((option, i) => i === index ? value : option) || []
    }));
  };

  const removeFlexibleOption = (categoryId: string, index: number) => {
    setFlexibleOptions(prev => ({
      ...prev,
      [categoryId]: prev[categoryId]?.filter((_, i) => i !== index) || []
    }));
  };

  const updateStructuredMeal = (day: number, categoryId: string, value: string) => {
    const key = `${day}-${categoryId}`;
    setStructuredMeals(prev => ({
      ...prev,
      [key]: value
    }));
  };


  const handleSave = async () => {
    if (!selectedClient || !title.trim()) {
      toast({
        title: "Ελλείπουσες πληροφορίες",
        description: "Παρακαλώ επιλέξτε πελάτη και προσθέστε τίτλο",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      let mealPlan;

      if (isEditMode) {
        // Update existing meal plan
        const { data: updatedPlan, error: planError } = await supabase
          .from('meal_plans')
          .update({
            client_id: selectedClient.id,
            title: title.trim(),
            type: planType,
            start_date: startDate?.toISOString().split('T')[0],
            notes: notes.trim() || null
          })
          .eq('id', editId)
          .select()
          .single();

        if (planError) throw planError;
        mealPlan = updatedPlan;

        // Delete existing content
        if (planType === 'flexible') {
          await supabase.from('flexible_plan_options').delete().eq('meal_plan_id', editId);
          await supabase.from('structured_plan_meals').delete().eq('meal_plan_id', editId);
        } else {
          await supabase.from('structured_plan_meals').delete().eq('meal_plan_id', editId);
          await supabase.from('flexible_plan_options').delete().eq('meal_plan_id', editId);
        }
      } else {
        // Create new meal plan
        const { data: newPlan, error: planError } = await supabase
          .from('meal_plans')
          .insert({
            client_id: selectedClient.id,
            title: title.trim(),
            type: planType,
            status: 'active',
            start_date: startDate?.toISOString().split('T')[0],
            ai_generated: !!aiGeneratedData,
            ai_prompt_used: aiGeneratedData ? JSON.stringify({
              clientName: selectedClient.name,
              planType,
              modifications: aiGeneratedData
            }) : null,
            notes: notes.trim() || null
          })
          .select()
          .single();

        if (planError) throw planError;
        mealPlan = newPlan;
      }

      // Save plan content based on type
      if (planType === 'flexible') {
        const flexibleInserts = [];
        
        Object.entries(flexibleOptions).forEach(([categoryId, options]) => {
          options.forEach((option, index) => {
            if (option.trim()) {
              flexibleInserts.push({
                meal_plan_id: mealPlan.id,
                category_id: categoryId,
                option_text: option.trim(),
                display_order: index
              });
            }
          });
        });

        if (flexibleInserts.length > 0) {
          const { error: optionsError } = await supabase
            .from('flexible_plan_options')
            .insert(flexibleInserts);

          if (optionsError) throw optionsError;
        }
      } else {
        const structuredInserts = [];
        
        Object.entries(structuredMeals).forEach(([key, description]) => {
          if (description.trim()) {
            const dashIndex = key.indexOf('-');
            const day = key.substring(0, dashIndex);
            const categoryId = key.substring(dashIndex + 1);
            structuredInserts.push({
              meal_plan_id: mealPlan.id,
              day_number: parseInt(day),
              category_id: categoryId,
              meal_description: description.trim()
            });
          }
        });

        if (structuredInserts.length > 0) {
          const { error: mealsError } = await supabase
            .from('structured_plan_meals')
            .insert(structuredInserts);

          if (mealsError) throw mealsError;
        }
      }

      // Save instructions
      if (isEditMode) {
        // Delete existing instructions if editing
        await supabase.from('plan_instructions').delete().eq('meal_plan_id', mealPlan.id);
      }

      // Always save default instructions first
      const defaultInstructionInserts = DEFAULT_MEAL_PLAN_INSTRUCTIONS.map(instruction => ({
        meal_plan_id: mealPlan.id,
        instruction_type: instruction.instruction_type,
        content: instruction.content,
        display_order: instruction.display_order
      }));

      const { error: defaultInstructionsError } = await supabase
        .from('plan_instructions')
        .insert(defaultInstructionInserts);

      if (defaultInstructionsError) throw defaultInstructionsError;

      // Save custom instructions if they exist
      if (customInstructions.trim()) {
        const customInstructionInsert = {
          meal_plan_id: mealPlan.id,
          instruction_type: 'custom',
          content: customInstructions.trim(),
          display_order: DEFAULT_MEAL_PLAN_INSTRUCTIONS.length // Place after default instructions
        };

        const { error: customInstructionsError } = await supabase
          .from('plan_instructions')
          .insert([customInstructionInsert]);

        if (customInstructionsError) throw customInstructionsError;
      }

      // Save AI-generated instructions if from AI (only for new plans without custom instructions)
      if (!isEditMode && aiGeneratedData?.mealPlan?.instructions && !customInstructions.trim()) {
        const aiInstructionInserts = aiGeneratedData.mealPlan.instructions.map((instruction, index) => ({
          meal_plan_id: mealPlan.id,
          instruction_type: 'ai_generated',
          content: instruction,
          display_order: index + DEFAULT_MEAL_PLAN_INSTRUCTIONS.length
        }));

        const { error: aiInstructionsError } = await supabase
          .from('plan_instructions')
          .insert(aiInstructionInserts);

        if (aiInstructionsError) throw aiInstructionsError;
      }

      toast({
        title: "Επιτυχής αποθήκευση!",
        description: isEditMode
          ? "Το διατροφικό πρόγραμμα ενημερώθηκε επιτυχώς"
          : "Το διατροφικό πρόγραμμα δημιουργήθηκε επιτυχώς",
      });

      navigate('/meal-plans');

    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Σφάλμα αποθήκευσης",
        description: "Δεν ήταν δυνατή η αποθήκευση του προγράμματος",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-accent/10">
        <div className="text-center">
          <img src={logo} alt="Meal Planner" className="h-16 w-auto mx-auto mb-4" />
          <p className="text-muted-foreground">Φόρτωση...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/meal-plans')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img src={logo} alt="Meal Planner" className="h-8 w-auto" />
            <div>
              <h1 className="text-xl font-semibold">
                {isEditMode ? 'Επεξεργασία Διατροφικού Προγράμματος' : 'Δημιουργία Διατροφικού Προγράμματος'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode ? 'Επεξεργαστείτε το υπάρχον πρόγραμμα' : 'Δημιουργήστε ένα νέο πρόγραμμα χειροκίνητα ή με AI'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Βασικές Πληροφορίες</CardTitle>
              <CardDescription>
                Επιλέξτε πελάτη και ορίστε τις βασικές παραμέτρους του προγράμματος
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Πελάτης *</Label>
                  <Select value={selectedClient?.id || ''} onValueChange={(value) => {
                    const client = clients.find(c => c.id === value);
                    setSelectedClient(client || null);
                    if (client) {
                      setTitle(`Διατροφικό πρόγραμμα για ${client.name}`);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Επιλέξτε πελάτη" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Τίτλος Προγράμματος *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="π.χ. Διατροφικό πρόγραμμα για Μαρία - Εβδομάδα 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planType">Τύπος Προγράμματος</Label>
                  <Select value={planType} onValueChange={(value: 'flexible' | 'structured') => setPlanType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Ελεύθερη Επιλογή</SelectItem>
                      <SelectItem value="structured">Συγκεκριμένα Γεύματα</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                <div className="space-y-2">
                  <Label>Ημερομηνία Έναρξης</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Επιλέξτε ημερομηνία"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Σημειώσεις</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Προσθέστε ειδικές οδηγίες ή σημειώσεις..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Δημιουργία με Τεχνητή Νοημοσύνη
              </CardTitle>
              <CardDescription>
                Χρησιμοποιήστε AI για να δημιουργήσετε αυτόματα το διατροφικό πρόγραμμα
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setShowAIModal(true)}
                  disabled={!selectedClient}
                  className="flex-1"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Δημιουργία με AI
                </Button>
                {aiGeneratedData && (
                  <Badge variant="secondary" className="self-center">
                    Δημιουργήθηκε με AI
                  </Badge>
                )}
              </div>
              {!selectedClient && (
                <p className="text-sm text-muted-foreground mt-2">
                  Επιλέξτε πρώτα έναν πελάτη για να χρησιμοποιήσετε το AI
                </p>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Plan Content */}
          {planType === 'flexible' ? (
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle>Επιλογές Γευμάτων</CardTitle>
                <CardDescription>
                  Προσθέστε επιλογές για κάθε κατηγορία γεύματος
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {categories.map(category => {
                  const categoryName = (category.display_name_greek || category.name).toLowerCase();
                  const isBreakfast = categoryName.includes('πρωινό') || categoryName.includes('breakfast');
                  const isSnack = categoryName.includes('snack') || categoryName.includes('δεκατιανό') || categoryName.includes('απογευματινό');
                  const isLunch = categoryName.includes('μεσημεριανό') || categoryName.includes('lunch');
                  const isDinner = categoryName.includes('δείπνο') || categoryName.includes('βραδινό') || categoryName.includes('dinner');
                  
                  const badgeClass = isBreakfast ? 'category-badge-breakfast' : 
                                     isSnack ? 'category-badge-snack' :
                                     isLunch ? 'category-badge-lunch' :
                                     isDinner ? 'category-badge-dinner' : 'bg-muted text-muted-foreground';
                  
                  return (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`category-badge ${badgeClass}`}>
                          {category.display_name_greek}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addFlexibleOption(category.id)}
                          className="text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary"
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          Προσθήκη
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(flexibleOptions[category.id] || ['']).map((option, index) => (
                          <div key={index} className="meal-option-card">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                Επιλογή {index + 1}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFlexibleOption(category.id, index)}
                                disabled={(flexibleOptions[category.id]?.length || 0) <= 1}
                                className="card-actions h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <Textarea
                              value={option}
                              onChange={(e) => updateFlexibleOption(category.id, index, e.target.value)}
                              placeholder={`Περιγράψτε το γεύμα...`}
                              rows={3}
                              className="text-sm leading-relaxed border-0 bg-muted/30 focus-visible:bg-background"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle>Εβδομαδιαίο Πρόγραμμα</CardTitle>
                <CardDescription>
                  Ορίστε συγκεκριμένα γεύματα για κάθε ημέρα της εβδομάδας
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="1" className="w-full">
                  <TabsList className="w-full grid grid-cols-7 mb-6">
                    {['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ'].map((dayName, index) => (
                      <TabsTrigger
                        key={index + 1}
                        value={String(index + 1)}
                      >
                        {dayName}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <TabsContent key={day} value={String(day)} className="mt-0">
                      <div className="p-4 border border-border rounded-xl bg-muted/30">
                        <h3 className="text-lg font-semibold mb-4 text-foreground">
                          {['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'][day - 1]}
                        </h3>
                        <div className="space-y-4">
                          {categories.map(category => (
                            <div key={category.id} className="space-y-2">
                              <Label className="text-sm font-medium text-muted-foreground">
                                {category.display_name_greek}
                              </Label>
                              <Textarea
                                value={structuredMeals[`${day}-${category.id}`] || ''}
                                onChange={(e) => updateStructuredMeal(day, category.id, e.target.value)}
                                placeholder={`Γεύμα για ${category.display_name_greek.toLowerCase()}`}
                                rows={2}
                                className="bg-background"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Instructions Section - Single Custom Instruction */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Ειδικές Οδηγίες</CardTitle>
                <CardDescription>
                  Προσθέστε προσαρμοσμένες οδηγίες για αυτόν τον πελάτη
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Προσαρμοσμένες Οδηγίες για τον Πελάτη
                </Label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Εισάγετε ειδικές οδηγίες για αυτόν τον πελάτη (προαιρετικό)..."
                  rows={4}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground">
                  Οι γενικές οδηγίες (νερό, ελαιόλαδο, αντικαταστάσεις) εμφανίζονται αυτόματα. 
                  Εδώ μπορείτε να προσθέσετε μόνο ειδικές οδηγίες για αυτόν τον πελάτη.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/meal-plans')}>
              Ακύρωση
            </Button>
            {isEditMode && (
              <Button 
                variant="secondary" 
                onClick={() => {
                  // Navigate to public meal plan view
                  if (editId) {
                    supabase
                      .from('meal_plans')
                      .select('share_token')
                      .eq('id', editId)
                      .single()
                      .then(({ data }) => {
                        if (data?.share_token) {
                          window.open(`/plan/${data.share_token}`, '_blank');
                        }
                      });
                  }
                }}
              >
                Προβολή
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving || !selectedClient || !title.trim()}>
              {saving 
                ? "Αποθήκευση..." 
                : isEditMode 
                  ? "Ενημέρωση Προγράμματος"
                  : "Αποθήκευση Προγράμματος"
              }
            </Button>
          </div>
        </div>
      </div>

      {/* AI Generation Modal */}
      <EnhancedAIGenerationModal
        isOpen={showAIModal}
        client={selectedClient!}
        onGenerate={handleAIGenerate}
        onClose={() => setShowAIModal(false)}
      />
    </div>
  );
};

export default MealPlanWizard;