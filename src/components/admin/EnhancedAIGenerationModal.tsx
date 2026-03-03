import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogStickyFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, ChevronDown, FileText, History, User, Settings, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Client, MealPlan } from '@/types/mealPlan.types';
import { PromptBuilderService, ClientContext, PreviousPlanContext, ModificationInstructions } from '@/services/promptBuilderService';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import NutritionalTargetsInput, { NutritionalTargets } from './NutritionalTargetsInput';

interface EnhancedAIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onGenerate: (mealPlan: any, promptContext: any) => void;
}

const dietaryRestrictionOptions = [
  'Χωρίς γλουτένη',
  'Χωρίς γαλακτοκομικά',
  'Χορτοφαγικό',
  'Vegan',
  'Χωρίς ζάχαρη',
  'Χαμηλά υδατάνθρακες'
];

const quickActionOptions = [
  'Αυξημένη ποικιλία',
  'Μείωση μερίδων',
  'Περισσότερες χορτοφαγικές επιλογές',
  'Εποχιακά υλικά',
  'Περισσότερες πρωτεΐνες',
  'Λιγότεροι υδατάνθρακες το βράδυ'
];

const tabConfig = [
  { value: 'basic', label: 'Βασικά', icon: FileText },
  { value: 'previous', label: 'Προηγούμενα', icon: History },
  { value: 'context', label: 'Πλαίσιο', icon: User },
  { value: 'modifications', label: 'Αλλαγές', icon: Settings },
  { value: 'preview', label: 'Προεπισκόπηση', icon: Eye },
];

export default function EnhancedAIGenerationModal({
  isOpen,
  onClose,
  client,
  onGenerate
}: EnhancedAIGenerationModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [isGenerating, setIsGenerating] = useState(false);

  // Basic Info
  const [planType, setPlanType] = useState<'flexible' | 'structured'>('flexible');
  const [nutritionalTargets, setNutritionalTargets] = useState<NutritionalTargets>({});

  // Previous Plans
  const [previousPlans, setPreviousPlans] = useState<MealPlan[]>([]);
  const [selectedPreviousPlanId, setSelectedPreviousPlanId] = useState<string>('');
  const [previousPlanContext, setPreviousPlanContext] = useState<PreviousPlanContext | null>(null);
  const [planFeedback, setPlanFeedback] = useState({ what_worked: '', what_didnt_work: '', progress_notes: '' });

  // Client Context
  const [clientContext, setClientContext] = useState<ClientContext>({
    name: client?.name || '',
    special_instructions: '',
    dietary_restrictions: [],
    medical_conditions: '',
    goals: '',
    food_preferences: ''
  });

  // Modifications
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [selectedQuickActions, setSelectedQuickActions] = useState<string[]>([]);
  const [customModifications, setCustomModifications] = useState('');
  const [preferences, setPreferences] = useState('');

  // Prompt Preview
  const [assembledPrompt, setAssembledPrompt] = useState<any>(null);
  const [editedUserPrompt, setEditedUserPrompt] = useState<string>('');
  const [isUserPromptEdited, setIsUserPromptEdited] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    system: false,
    client: false,
    previous: false,
    modifications: false,
    instructions: false
  });

  useEffect(() => {
    if (isOpen && client?.id) {
      fetchClientData();
      fetchPreviousPlans();
    }
  }, [isOpen, client?.id]);

  useEffect(() => {
    if (selectedPreviousPlanId && selectedPreviousPlanId !== 'none') {
      loadPreviousPlanContext();
    } else {
      setPreviousPlanContext(null);
    }
  }, [selectedPreviousPlanId]);

  useEffect(() => {
    if (activeTab === 'preview') {
      assemblePromptPreview();
    }
  }, [activeTab, planType, clientContext, previousPlanContext, selectedRestrictions, selectedQuickActions, customModifications, preferences, nutritionalTargets]);

  const fetchClientData = async () => {
    if (!client?.id) return;

    const [clientResult, measurementsResult, historyResult] = await Promise.all([
      supabase
        .from('clients')
        .select('*')
        .eq('id', client.id)
        .single(),
      supabase
        .from('client_body_measurements')
        .select('height_cm, weight_kg, measured_at')
        .eq('client_id', client.id)
        .order('measured_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      // Fetch client history notes
      supabase
        .from('client_history_notes')
        .select('note_date, category, content')
        .eq('client_id', client.id)
        .order('note_date', { ascending: false })
        .limit(5)
    ]);

    const { data, error } = clientResult;
    const latestMeasurement = measurementsResult.data;
    const historyNotes = historyResult.data;

    if (data && !error) {
      setClientContext({
        name: data.name,
        special_instructions: data.special_instructions || '',
        dietary_restrictions: data.dietary_restrictions || [],
        medical_conditions: data.medical_conditions || '',
        goals: data.goals || '',
        food_preferences: data.food_preferences || '',
        body_measurements: latestMeasurement ? {
          height_cm: latestMeasurement.height_cm,
          weight_kg: latestMeasurement.weight_kg,
          measured_at: latestMeasurement.measured_at
        } : undefined,
        // Include history notes for AI context
        history_notes: historyNotes || undefined
      });
    }
  };

  const fetchPreviousPlans = async () => {
    if (!client?.id) return;

    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setPreviousPlans(data as MealPlan[]);
      // Auto-select the most recent plan if available
      if (data.length > 0 && !selectedPreviousPlanId) {
        setSelectedPreviousPlanId(data[0].id);
      }
    }
  };

  const loadPreviousPlanContext = async () => {
    const plan = previousPlans.find(p => p.id === selectedPreviousPlanId);
    if (!plan) return;

    let content: any = {};
    
    if (plan.type === 'flexible') {
      const { data: options } = await supabase
        .from('flexible_plan_options')
        .select('*, meal_categories(name, display_name_greek)')
        .eq('meal_plan_id', plan.id)
        .order('display_order');

      if (options) {
        const grouped = options.reduce((acc: any, opt: any) => {
          const categoryName = opt.meal_categories?.display_name_greek || opt.meal_categories?.name || 'Unknown';
          if (!acc[categoryName]) acc[categoryName] = [];
          acc[categoryName].push(opt.option_text);
          return acc;
        }, {});

        content.flexible = Object.entries(grouped).map(([categoryName, options]) => ({
          categoryName,
          options
        }));
      }
    } else {
      const { data: meals } = await supabase
        .from('structured_plan_meals')
        .select('*, meal_categories(name, display_name_greek)')
        .eq('meal_plan_id', plan.id)
        .order('day_number');

      if (meals) {
        const grouped = meals.reduce((acc: any, meal: any) => {
          if (!acc[meal.day_number]) acc[meal.day_number] = { day: meal.day_number, meals: {} };
          const categoryName = meal.meal_categories?.display_name_greek || meal.meal_categories?.name || 'Unknown';
          acc[meal.day_number].meals[categoryName] = meal.meal_description;
          return acc;
        }, {});

        content.structured = Object.values(grouped);
      }
    }

    const { data: history } = await supabase
      .from('client_meal_plan_history')
      .select('*')
      .eq('meal_plan_id', plan.id)
      .single();

    setPreviousPlanContext({
      title: plan.title,
      type: plan.type,
      content,
      feedback: history ? {
        what_worked: history.what_worked || undefined,
        what_didnt_work: history.what_didnt_work || undefined,
        progress_notes: history.progress_notes || undefined
      } : undefined
    });
  };

  const assemblePromptPreview = async () => {
    const modifications: ModificationInstructions = {
      text: customModifications,
      quickActions: selectedQuickActions
    };

    const assembled = await PromptBuilderService.assemblePrompt(
      clientContext,
      planType,
      previousPlanContext || undefined,
      modifications,
      selectedRestrictions.length > 0 ? selectedRestrictions : undefined,
      nutritionalTargets
    );

    setAssembledPrompt(assembled);
    if (!isUserPromptEdited) {
      setEditedUserPrompt(assembled.userPrompt);
    }
  };

  const handleGenerate = async () => {
    console.log('=== handleGenerate STARTED ===');
    setIsGenerating(true);

    try {
      const modifications: ModificationInstructions = {
        text: customModifications,
        quickActions: selectedQuickActions
      };

      console.log('Calling PromptBuilderService.assemblePrompt...');
      const assembled = await PromptBuilderService.assemblePrompt(
        clientContext,
        planType,
        previousPlanContext || undefined,
        modifications,
        selectedRestrictions,
        nutritionalTargets
      );
      console.log('assemblePrompt completed, prompt length:', assembled.userPrompt.length);

      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('ai_model')
        .eq('id', 'default')
        .maybeSingle();
      
      const aiModel = settingsData?.ai_model || 'gpt-4o';

      console.log('--- AI Generation Config ---');
      console.log('Client:', client?.name);
      console.log('Plan type:', planType);
      console.log('AI Model:', aiModel);
      console.log('Prompt lengths:', { system: assembled.systemPrompt.length, user: assembled.userPrompt.length });

      const userPromptToUse = isUserPromptEdited ? editedUserPrompt : assembled.userPrompt;

      const requestBody = {
        clientName: client?.name || '',
        planType,
        dietaryRestrictions: selectedRestrictions,
        preferences: preferences ? [preferences] : undefined,
        systemPrompt: assembled.systemPrompt,
        userPrompt: userPromptToUse,
        previousPlanId: selectedPreviousPlanId !== 'none' ? selectedPreviousPlanId : undefined,
        aiModel
      } as const;

      console.log('Invoking edge function generate-meal-plan...');
      console.log('Request body:', JSON.stringify(requestBody, null, 2).slice(0, 500));

      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: requestBody
      });

      console.log('Edge function completed');
      console.log('Response data:', data);
      console.log('Response error:', error);

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Edge function error');
      }

      if (data.success && data.mealPlan) {
        const promptContext = {
          client: clientContext,
          previousPlan: previousPlanContext,
          modifications,
          nutritionalTargets,
          assembledPrompt: {
            system: assembled.systemPrompt,
            user: assembled.userPrompt,
            estimatedTokens: assembled.estimatedTokens
          }
        };

        onGenerate(data, promptContext);
        resetState();
        onClose();

        toast({
          title: 'Επιτυχία!',
          description: 'Το διατροφικό πρόγραμμα δημιουργήθηκε με επιτυχία'
        });
      } else {
        console.warn('AI returned unsuccessful payload:', data);
        throw new Error(data.error || 'Άγνωστο σφάλμα');
      }
    } catch (error: any) {
      console.error('=== AI Generation FAILED ===');
      console.error('Error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);

      toast({
        title: 'Σφάλμα',
        description: error?.message || 'Αποτυχία δημιουργίας προγράμματος',
        variant: 'destructive'
      });
    } finally {
      console.log('=== handleGenerate FINISHED ===');
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const resetState = () => {
    setPlanType('flexible');
    setSelectedPreviousPlanId('none');
    setPreviousPlanContext(null);
    setSelectedRestrictions([]);
    setSelectedQuickActions([]);
    setCustomModifications('');
    setNutritionalTargets({});
    setActiveTab('basic');
    setPlanFeedback({ what_worked: '', what_didnt_work: '', progress_notes: '' });
    setEditedUserPrompt('');
    setIsUserPromptEdited(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent size="xl" className="max-h-[90vh] overflow-hidden flex flex-col min-h-0">
        {/* Modal Header */}
        <div className="px-8 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Δημιουργία με AI
              </h2>
              <p className="text-sm text-muted-foreground">
                {client?.name ? `Πελάτης: ${client.name}` : 'Νέο διατροφικό πρόγραμμα'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 h-0 flex flex-col overflow-hidden">
          <div className="px-8">
            <TabsList variant="underline" className="w-full">
              {tabConfig.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} variant="underline">
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-8 py-6">
              {/* Tab 1: Basic Info */}
              <TabsContent value="basic" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Βασικές Πληροφορίες
                    </p>
                    <div className="h-px bg-border" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="planType">Τύπος Προγράμματος</Label>
                    <Select value={planType} onValueChange={(v: any) => setPlanType(v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flexible">Ελεύθερο Πρόγραμμα</SelectItem>
                        <SelectItem value="structured">Δομημένο Πρόγραμμα</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {planType === 'flexible' 
                        ? 'Πολλαπλές επιλογές ανά γεύμα για 2 εβδομάδες' 
                        : 'Συγκεκριμένα γεύματα για κάθε ημέρα της εβδομάδας'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Διατροφικοί Στόχοι
                    </p>
                    <div className="h-px bg-border" />
                  </div>
                  
                  <NutritionalTargetsInput
                    targets={nutritionalTargets}
                    onChange={setNutritionalTargets}
                  />
                </div>
              </TabsContent>

              {/* Tab 2: Previous Plans */}
              <TabsContent value="previous" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Επιλογή Βάσης
                    </p>
                    <div className="h-px bg-border" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previousPlan">Επιλογή Προηγούμενου Προγράμματος</Label>
                    <Select value={selectedPreviousPlanId} onValueChange={setSelectedPreviousPlanId}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Χωρίς προηγούμενο πρόγραμμα" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Χωρίς προηγούμενο</SelectItem>
                        {previousPlans.map(plan => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.title} - {plan.type === 'flexible' ? 'Ελεύθερο' : 'Δομημένο'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Χρησιμοποιήστε ένα προηγούμενο πρόγραμμα ως βάση</p>
                  </div>
                </div>

                {previousPlanContext && (
                  <Card className="border-secondary/50 bg-secondary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Προεπισκόπηση Προηγούμενου</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-4">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-muted-foreground">Τίτλος:</span>{' '}
                          <span className="font-medium">{previousPlanContext.title}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Τύπος:</span>{' '}
                          <Badge variant="secondary" className="ml-1">
                            {previousPlanContext.type === 'flexible' ? 'Ελεύθερο' : 'Δομημένο'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 pt-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Ανατροφοδότηση από Πελάτη
                        </p>
                        <div className="h-px bg-border" />
                      </div>

                      <div className="space-y-3">
                        <Textarea
                          placeholder="Τι λειτούργησε καλά..."
                          value={planFeedback.what_worked}
                          onChange={(e) => setPlanFeedback({ ...planFeedback, what_worked: e.target.value })}
                          className="min-h-[80px]"
                        />
                        <Textarea
                          placeholder="Τι δεν λειτούργησε..."
                          value={planFeedback.what_didnt_work}
                          onChange={(e) => setPlanFeedback({ ...planFeedback, what_didnt_work: e.target.value })}
                          className="min-h-[80px]"
                        />
                        <Textarea
                          placeholder="Σημειώσεις προόδου..."
                          value={planFeedback.progress_notes}
                          onChange={(e) => setPlanFeedback({ ...planFeedback, progress_notes: e.target.value })}
                          className="min-h-[80px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Tab 3: Client Context */}
              <TabsContent value="context" className="space-y-6 mt-0">
                {/* Body Measurements */}
                {clientContext.body_measurements && (clientContext.body_measurements.height_cm || clientContext.body_measurements.weight_kg) && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Σωματικές Μετρήσεις</CardTitle>
                      <CardDescription className="text-xs">Τελευταία καταγεγραμμένη μέτρηση</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground mb-1">Ύψος</p>
                          <p className="text-lg font-semibold">
                            {clientContext.body_measurements.height_cm ? `${clientContext.body_measurements.height_cm} cm` : '-'}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground mb-1">Βάρος</p>
                          <p className="text-lg font-semibold">
                            {clientContext.body_measurements.weight_kg ? `${clientContext.body_measurements.weight_kg} kg` : '-'}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground mb-1">BMI</p>
                          <p className="text-lg font-semibold">
                            {clientContext.body_measurements.height_cm && clientContext.body_measurements.weight_kg
                              ? (clientContext.body_measurements.weight_kg / ((clientContext.body_measurements.height_cm / 100) ** 2)).toFixed(1)
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Πληροφορίες Πελάτη
                    </p>
                    <div className="h-px bg-border" />
                  </div>

                  {/* Dietary Restrictions from profile */}
                  {clientContext.dietary_restrictions && clientContext.dietary_restrictions.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Διατροφικοί Περιορισμοί (από προφίλ)</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {clientContext.dietary_restrictions.map(r => (
                          <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Ιατρικές Καταστάσεις</Label>
                    <Textarea
                      value={clientContext.medical_conditions}
                      onChange={(e) => setClientContext({ ...clientContext, medical_conditions: e.target.value })}
                      placeholder="Αλλεργίες, ιατρικές καταστάσεις..."
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Στόχοι</Label>
                    <Textarea
                      value={clientContext.goals}
                      onChange={(e) => setClientContext({ ...clientContext, goals: e.target.value })}
                      placeholder="Στόχοι πελάτη..."
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Προτιμήσεις Τροφίμων</Label>
                    <Textarea
                      value={clientContext.food_preferences}
                      onChange={(e) => setClientContext({ ...clientContext, food_preferences: e.target.value })}
                      placeholder="Αγαπημένα ή μη αγαπημένα τρόφιμα..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Modifications */}
              <TabsContent value="modifications" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Διατροφικοί Περιορισμοί
                    </p>
                    <div className="h-px bg-border" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {dietaryRestrictionOptions.map(option => (
                      <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id={option}
                          checked={selectedRestrictions.includes(option)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRestrictions([...selectedRestrictions, option]);
                            } else {
                              setSelectedRestrictions(selectedRestrictions.filter(r => r !== option));
                            }
                          }}
                        />
                        <label htmlFor={option} className="text-sm font-medium cursor-pointer flex-1">{option}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Γρήγορες Ενέργειες
                    </p>
                    <div className="h-px bg-border" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {quickActionOptions.map(action => (
                      <Badge
                        key={action}
                        variant={selectedQuickActions.includes(action) ? 'default' : 'outline'}
                        className="cursor-pointer text-sm px-3 py-1.5 transition-all hover:scale-105"
                        onClick={() => {
                          if (selectedQuickActions.includes(action)) {
                            setSelectedQuickActions(selectedQuickActions.filter(a => a !== action));
                          } else {
                            setSelectedQuickActions([...selectedQuickActions, action]);
                          }
                        }}
                      >
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Επιπλέον Οδηγίες
                    </p>
                    <div className="h-px bg-border" />
                  </div>

                  <div className="space-y-2">
                    <Label>Συγκεκριμένες Αλλαγές</Label>
                    <Textarea
                      value={customModifications}
                      onChange={(e) => setCustomModifications(e.target.value)}
                      placeholder="π.χ. Περισσότερες πρωτεΐνες το βράδυ, διαφορετικές επιλογές πρωινού..."
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground">Γράψτε οποιεσδήποτε ειδικές απαιτήσεις ή τροποποιήσεις</p>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 5: Prompt Preview */}
              <TabsContent value="preview" className="space-y-6 mt-0">
                {assembledPrompt ? (
                  <>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm font-medium">Εκτιμώμενα Tokens: {assembledPrompt.estimatedTokens.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Κόστος: ~${(assembledPrompt.estimatedTokens * 0.00001).toFixed(4)}</p>
                    </div>

                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-11">
                          <span className="font-medium">System Prompt</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-3">
                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto whitespace-pre-wrap max-h-[400px] border border-border">
                          {assembledPrompt.systemPrompt}
                        </pre>
                      </CollapsibleContent>
                    </Collapsible>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">User Prompt (Επεξεργάσιμο)</Label>
                        {isUserPromptEdited && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setEditedUserPrompt(assembledPrompt.userPrompt);
                              setIsUserPromptEdited(false);
                            }}
                          >
                            Επαναφορά
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={editedUserPrompt}
                        onChange={(e) => {
                          setEditedUserPrompt(e.target.value);
                          setIsUserPromptEdited(true);
                        }}
                        className="min-h-[300px] font-mono text-xs"
                        placeholder="Το user prompt θα εμφανιστεί εδώ..."
                      />
                      {isUserPromptEdited && (
                        <p className="text-xs text-amber-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Έχετε επεξεργαστεί το prompt. Οι αλλαγές στις άλλες καρτέλες δεν θα ενημερώσουν αυτό το πεδίο.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Φόρτωση προεπισκόπησης...
                  </div>
                )}
              </TabsContent>
            </div>
          </div>

          {/* Sticky Footer */}
          <DialogStickyFooter>
            <Button variant="ghost" onClick={handleClose} disabled={isGenerating}>
              Ακύρωση
            </Button>
            <Button variant="ai" size="lg" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Δημιουργία...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Δημιουργία με AI
                </>
              )}
            </Button>
          </DialogStickyFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
