import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogIcon,
} from '@/components/ui/alert-dialog';
import { SearchFilter, FilterDropdown, ActiveFilters } from '@/components/ui/search-filter';
import { DataPagination, usePagination } from '@/components/ui/data-pagination';
import { MealPlansEmptyState, NoResultsState } from '@/components/ui/empty-state';
import { Plus } from 'lucide-react';
import { MealPlan, Client } from '@/types/mealPlan.types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MealPlanCard from '@/components/meal-plans/MealPlanCard';
import { MealPlansSkeletonLoader } from '@/components/ui/skeleton-loader';

const statusOptions = [
  { label: 'Πρόχειρο', value: 'draft' },
  { label: 'Ενεργό', value: 'active' },
  { label: 'Αρχειοθετημένο', value: 'archived' },
];

const typeOptions = [
  { label: 'Ευέλικτο', value: 'flexible' },
  { label: 'Δομημένο', value: 'structured' },
];

export default function MealPlans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mealPlans, setMealPlans] = useState<(MealPlan & { client?: Client })[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<(MealPlan & { client?: Client })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [clientFilter, setClientFilter] = useState('all');
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const { currentPage, totalPages, paginatedItems, setCurrentPage, totalItems } = usePagination(filteredPlans, 9);

  // Handle client parameter from URL
  useEffect(() => {
    const clientParam = searchParams.get('client');
    if (clientParam) {
      setClientFilter(clientParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPlans();
  }, [mealPlans, searchTerm, statusFilter, typeFilter, clientFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [clientsResponse, plansResponse] = await Promise.all([
        supabase
          .from('clients')
          .select('id, name, email, phone, notes, created_at, updated_at')
          .order('name'),
        supabase
          .from('meal_plans')
          .select(`
            id, title, type, status, start_date, 
            ai_generated, created_at, updated_at, notes, 
            client_id, share_token
          `)
          .order('updated_at', { ascending: false })
      ]);

      if (clientsResponse.error) throw clientsResponse.error;
      if (plansResponse.error) throw plansResponse.error;

      const clientsData = clientsResponse.data || [];
      const plansData = plansResponse.data || [];

      setClients(clientsData);

      const plansWithClients = plansData.map(plan => ({
        ...plan,
        type: plan.type as 'flexible' | 'structured',
        status: plan.status as 'draft' | 'active' | 'archived',
        client: clientsData.find(client => client.id === plan.client_id)
      }));

      setMealPlans(plansWithClients);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η φόρτωση των δεδομένων.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPlans = () => {
    let filtered = [...mealPlans];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(plan => 
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(plan => statusFilter.includes(plan.status));
    }

    // Type filter
    if (typeFilter.length > 0) {
      filtered = filtered.filter(plan => typeFilter.includes(plan.type));
    }

    // Client filter
    if (clientFilter !== 'all') {
      filtered = filtered.filter(plan => plan.client_id === clientFilter);
    }

    setFilteredPlans(filtered);
  };

  const handleDelete = async (planId: string) => {
    try {
      await Promise.all([
        supabase.from('flexible_plan_options').delete().eq('meal_plan_id', planId),
        supabase.from('structured_plan_meals').delete().eq('meal_plan_id', planId),
        supabase.from('plan_instructions').delete().eq('meal_plan_id', planId)
      ]);

      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Επιτυχία",
        description: "Το πρόγραμμα διαγράφηκε επιτυχώς.",
      });

      setPlanToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η διαγραφή του προγράμματος.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (plan: MealPlan) => {
    try {
      if (plan.status === 'draft') {
        const { error } = await supabase
          .from('meal_plans')
          .update({ status: 'active' })
          .eq('id', plan.id);

        if (error) throw error;
        
        setMealPlans(prev => prev.map(p => 
          p.id === plan.id ? { ...p, status: 'active' as const } : p
        ));
        
        toast({
          title: "Πρόγραμμα ενεργοποιήθηκε!",
          description: "Το πρόγραμμα είναι πλέον διαθέσιμο για κοινοποίηση",
        });
      }
      
      const shareUrl = `${window.location.origin}/plan/${plan.share_token}`;
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Σύνδεσμος αντιγράφηκε!",
        description: "Μπορείτε να στείλετε τον σύνδεσμο στον πελάτη σας",
      });
    } catch (error) {
      console.error('Error sharing plan:', error);
      toast({
        title: "Σφάλμα κοινοποίησης",
        description: "Δεν ήταν δυνατή η κοινοποίηση του προγράμματος",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (planId: string, newStatus: 'draft' | 'active' | 'archived') => {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .update({ status: newStatus })
        .eq('id', planId);

      if (error) throw error;
      
      setMealPlans(prev => prev.map(p => 
        p.id === planId ? { ...p, status: newStatus } : p
      ));
      
      const messages = {
        active: 'Το πρόγραμμα ενεργοποιήθηκε επιτυχώς',
        archived: 'Το πρόγραμμα αρχειοθετήθηκε επιτυχώς',
        draft: 'Το πρόγραμμα επέστρεψε σε πρόχειρο'
      };
      
      toast({
        title: "Επιτυχία!",
        description: messages[newStatus],
      });
    } catch (error) {
      console.error('Error updating plan status:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η ενημέρωση της κατάστασης",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (plan: MealPlan) => {
    try {
      const { data: newPlan, error: planError } = await supabase
        .from('meal_plans')
        .insert({
          client_id: plan.client_id,
          title: `${plan.title} (Αντίγραφο)`,
          type: plan.type,
          status: 'draft',
          ai_generated: plan.ai_generated,
          notes: plan.notes
        })
        .select()
        .single();

      if (planError) throw planError;

      if (plan.type === 'flexible') {
        const { data: options } = await supabase
          .from('flexible_plan_options')
          .select('*')
          .eq('meal_plan_id', plan.id);

        if (options && options.length > 0) {
          const newOptions = options.map(option => ({
            meal_plan_id: newPlan.id,
            category_id: option.category_id,
            option_text: option.option_text,
            display_order: option.display_order
          }));

          await supabase.from('flexible_plan_options').insert(newOptions);
        }
      }

      if (plan.type === 'structured') {
        const { data: meals } = await supabase
          .from('structured_plan_meals')
          .select('*')
          .eq('meal_plan_id', plan.id);

        if (meals && meals.length > 0) {
          const newMeals = meals.map(meal => ({
            meal_plan_id: newPlan.id,
            day_number: meal.day_number,
            category_id: meal.category_id,
            meal_description: meal.meal_description
          }));

          await supabase.from('structured_plan_meals').insert(newMeals);
        }
      }

      toast({
        title: "Επιτυχία",
        description: "Το πρόγραμμα αντιγράφηκε επιτυχώς.",
      });

      fetchData();
    } catch (error) {
      console.error('Error duplicating meal plan:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η αντιγραφή του προγράμματος.",
        variant: "destructive",
      });
    }
  };

  const getActiveFilters = () => {
    const filters: { key: string; label: string; value: string; displayValue: string }[] = [];
    
    statusFilter.forEach(status => {
      const option = statusOptions.find(o => o.value === status);
      if (option) {
        filters.push({ key: 'status', label: 'Κατάσταση', value: status, displayValue: option.label });
      }
    });

    typeFilter.forEach(type => {
      const option = typeOptions.find(o => o.value === type);
      if (option) {
        filters.push({ key: 'type', label: 'Τύπος', value: type, displayValue: option.label });
      }
    });

    if (clientFilter !== 'all') {
      const client = clients.find(c => c.id === clientFilter);
      if (client) {
        filters.push({ key: 'client', label: 'Πελάτης', value: clientFilter, displayValue: client.name });
      }
    }

    return filters;
  };

  const handleRemoveFilter = (key: string, value: string) => {
    if (key === 'status') {
      setStatusFilter(prev => prev.filter(v => v !== value));
    } else if (key === 'type') {
      setTypeFilter(prev => prev.filter(v => v !== value));
    } else if (key === 'client') {
      setClientFilter('all');
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter([]);
    setTypeFilter([]);
    setClientFilter('all');
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Προγράμματα Διατροφής"
        subtitle="Φόρτωση..."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Προγράμματα' }]}
      >
        <MealPlansSkeletonLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Προγράμματα Διατροφής"
      subtitle={`${mealPlans.length} προγράμματα συνολικά`}
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Προγράμματα' }]}
      actions={
        <Button onClick={() => navigate('/meal-plans/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Νέο Πρόγραμμα
        </Button>
      }
    >
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <SearchFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Αναζήτηση πελάτη, προγράμματος..."
          className="sm:max-w-sm"
        />
        
        <div className="flex flex-wrap gap-2">
          <FilterDropdown
            label="Κατάσταση"
            options={statusOptions}
            selectedValues={statusFilter}
            onSelectionChange={setStatusFilter}
          />
          <FilterDropdown
            label="Τύπος"
            options={typeOptions}
            selectedValues={typeFilter}
            onSelectionChange={setTypeFilter}
          />
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[180px] h-11">
              <SelectValue placeholder="Πελάτης" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλοι οι πελάτες</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      <ActiveFilters
        filters={getActiveFilters()}
        onRemove={handleRemoveFilter}
        onClearAll={clearAllFilters}
        className="mb-4"
      />

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Βρέθηκαν {filteredPlans.length} από {mealPlans.length} προγράμματα
      </p>

      {/* Meal Plans Grid */}
      {mealPlans.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <MealPlansEmptyState onAction={() => navigate('/meal-plans/new')} />
          </CardContent>
        </Card>
      ) : filteredPlans.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <NoResultsState onClear={clearAllFilters} />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedItems.map((plan) => (
              <MealPlanCard
                key={plan.id}
                plan={plan}
                onView={(p) => navigate(`/plan/${p.share_token}`)}
                onEdit={(p) => navigate(`/meal-plans/edit/${p.id}`)}
                onShare={handleShare}
                onDuplicate={handleDuplicate}
                onDelete={(id) => setPlanToDelete(id)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
          
          <DataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={9}
            onPageChange={setCurrentPage}
            className="mt-6"
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogIcon variant="warning" />
            <AlertDialogTitle>Επιβεβαίωση Διαγραφής</AlertDialogTitle>
            <AlertDialogDescription>
              Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το πρόγραμμα;
              Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => planToDelete && handleDelete(planToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Διαγραφή
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
