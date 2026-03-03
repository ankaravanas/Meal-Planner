import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  User,
  Mail,
  Phone,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Share2,
  Eye,
  Target,
  Heart,
  Utensils,
  AlertCircle,
  ClipboardList
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Client, MealPlan, NutritionalTargets } from '@/types/mealPlan.types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MealPlanStatusBadge from '@/components/meal-plans/MealPlanStatusBadge';
import MealPlanTypeBadge from '@/components/meal-plans/MealPlanTypeBadge';
import ClientHistorySection from '@/components/clients/ClientHistorySection';

const ClientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [client, setClient] = useState<Client | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<MealPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [planToDelete, setPlanToDelete] = useState<MealPlan | null>(null);

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  useEffect(() => {
    const filtered = mealPlans.filter(plan =>
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlans(filtered);
  }, [mealPlans, searchTerm]);

  const fetchClientData = async () => {
    try {
      setLoading(true);

      // Fetch client and their meal plans concurrently
      const [clientResponse, plansResponse] = await Promise.all([
        supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('meal_plans')
          .select('*')
          .eq('client_id', id)
          .order('updated_at', { ascending: false })
      ]);

      if (clientResponse.error) {
        if (clientResponse.error.code === 'PGRST116') {
          navigate('/clients');
          toast({
            title: "Πελάτης δεν βρέθηκε",
            description: "Ο πελάτης που αναζητάτε δεν υπάρχει",
            variant: "destructive",
          });
          return;
        }
        throw clientResponse.error;
      }

      if (plansResponse.error) throw plansResponse.error;

      setClient(clientResponse.data);
      setMealPlans(plansResponse.data?.map(plan => ({
        ...plan,
        type: plan.type as 'flexible' | 'structured',
        status: plan.status as 'draft' | 'active' | 'archived',
        nutritional_targets: plan.nutritional_targets as NutritionalTargets | undefined
      })) || []);
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast({
        title: "Σφάλμα φόρτωσης",
        description: "Δεν ήταν δυνατή η φόρτωση των δεδομένων",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (plan: MealPlan) => {
    try {
      // Delete related data first to avoid foreign key constraints
      await Promise.all([
        supabase.from('flexible_plan_options').delete().eq('meal_plan_id', plan.id),
        supabase.from('structured_plan_meals').delete().eq('meal_plan_id', plan.id),
        supabase.from('plan_instructions').delete().eq('meal_plan_id', plan.id)
      ]);

      // Then delete the meal plan
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', plan.id);

      if (error) throw error;

      setMealPlans(mealPlans.filter(p => p.id !== plan.id));
      setPlanToDelete(null);
      
      toast({
        title: "Επιτυχής διαγραφή",
        description: `Το πρόγραμμα "${plan.title}" διαγράφηκε επιτυχώς`,
      });
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast({
        title: "Σφάλμα διαγραφής",
        description: "Δεν ήταν δυνατή η διαγραφή του προγράμματος",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (plan: MealPlan) => {
    try {
      // First update the plan status to active if it's draft
      if (plan.status === 'draft') {
        const { error } = await supabase
          .from('meal_plans')
          .update({ status: 'active' })
          .eq('id', plan.id);

        if (error) throw error;

        // Update local state
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
        description: "Μπορείτε να στείλετε τον σύνδεσμος στον πελάτη σας",
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

  const handleToggleActive = async (newStatus: boolean) => {
    if (!client) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update({ is_active: newStatus })
        .eq('id', client.id);

      if (error) throw error;

      setClient({ ...client, is_active: newStatus });

      toast({
        title: newStatus ? "Πελάτης ενεργοποιήθηκε" : "Πελάτης απενεργοποιήθηκε",
        description: newStatus
          ? "Ο πελάτης είναι πλέον ενεργός"
          : "Ο πελάτης είναι πλέον ανενεργός",
      });
    } catch (error) {
      console.error('Error toggling client status:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η αλλαγή κατάστασης",
        variant: "destructive",
      });
    }
  };

  const handleStatusToggle = async (planId: string, currentStatus: 'draft' | 'active' | 'archived') => {
    try {
      let newStatus: 'draft' | 'active' | 'archived';
      let message: string;
      
      switch (currentStatus) {
        case 'draft':
          newStatus = 'active';
          message = 'Το πρόγραμμα ενεργοποιήθηκε επιτυχώς';
          break;
        case 'active':
          newStatus = 'archived';
          message = 'Το πρόγραμμα αρχειοθετήθηκε επιτυχώς';
          break;
        case 'archived':
          newStatus = 'active';
          message = 'Το πρόγραμμα ενεργοποιήθηκε επιτυχώς';
          break;
        default:
          return;
      }

      const { error } = await supabase
        .from('meal_plans')
        .update({ status: newStatus })
        .eq('id', planId);

      if (error) throw error;
      
      // Update local state
      setMealPlans(prev => prev.map(p => 
        p.id === planId ? { ...p, status: newStatus } : p
      ));
      
      toast({
        title: "Επιτυχία!",
        description: message,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Προφίλ Πελάτη"
        subtitle="Φόρτωση..."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Πελάτες', href: '/clients' },
          { label: 'Προφίλ' },
        ]}
      >
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="h-64 bg-muted rounded-xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout
        title="Πελάτης δεν βρέθηκε"
        subtitle="Ο πελάτης που αναζητάτε δεν υπάρχει"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Πελάτες', href: '/clients' },
        ]}
      >
        <div />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={client.name}
      subtitle={`${mealPlans.length} διατροφικά προγράμματα`}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Πελάτες', href: '/clients' },
        { label: client.name },
      ]}
    >
      <div className="space-y-6">
        {/* Client Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl">{client.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={client.is_active !== false}
                        onCheckedChange={handleToggleActive}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <span className={`text-sm font-medium ${client.is_active !== false ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {client.is_active !== false ? "Ενεργός" : "Ανενεργός"}
                      </span>
                    </div>
                  </div>
                  <CardDescription>
                    Μέλος από {formatDate(client.created_at)}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/clients/${client.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Επεξεργασία
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Info */}
            <div className="flex flex-wrap gap-6">
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>

            {/* Dietary Restrictions */}
            {client.dietary_restrictions && client.dietary_restrictions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Διατροφικοί Περιορισμοί
                </h4>
                <div className="flex flex-wrap gap-2">
                  {client.dietary_restrictions.map((restriction, index) => (
                    <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Goals */}
            {client.goals && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  Στόχοι
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.goals}</p>
              </div>
            )}

            {/* Medical Conditions */}
            {client.medical_conditions && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Ιατρικές Καταστάσεις
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.medical_conditions}</p>
              </div>
            )}

            {/* Food Preferences */}
            {client.food_preferences && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-blue-500" />
                  Προτιμήσεις Τροφίμων
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.food_preferences}</p>
              </div>
            )}

            {/* Special Instructions */}
            {client.special_instructions && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-purple-500" />
                  Ειδικές Οδηγίες
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.special_instructions}</p>
              </div>
            )}

            {/* General Notes */}
            {client.notes && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Σημειώσεις
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meal Plans Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Διατροφικά Προγράμματα
                </CardTitle>
                <CardDescription>
                  {mealPlans.length === 0 
                    ? 'Δεν υπάρχουν προγράμματα για αυτόν τον πελάτη'
                    : `${mealPlans.length} προγράμματα συνολικά`
                  }
                </CardDescription>
              </div>
              <Button onClick={() => navigate(`/meal-plans/new?client=${client.id}`)}>
                <Plus className="mr-2 h-4 w-4" />
                Νέο Πρόγραμμα
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {mealPlans.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Αναζήτηση προγραμμάτων..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {mealPlans.length === 0 ? 'Δεν υπάρχουν προγράμματα' : 'Δεν βρέθηκαν αποτελέσματα'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {mealPlans.length === 0 
                    ? 'Δημιουργήστε το πρώτο διατροφικό πρόγραμμα για αυτόν τον πελάτη'
                    : 'Δοκιμάστε διαφορετικούς όρους αναζήτησης'
                  }
                </p>
                {mealPlans.length === 0 && (
                  <Button onClick={() => navigate(`/meal-plans/new?client=${client.id}`)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Δημιουργία Προγράμματος
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlans.map((plan) => (
                  <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{plan.title}</CardTitle>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div 
                            className="cursor-pointer"
                            onClick={() => handleStatusToggle(plan.id, plan.status)}
                            title={
                              plan.status === 'draft' ? 'Κάντε κλικ για ενεργοποίηση' :
                              plan.status === 'active' ? 'Κάντε κλικ για αρχειοθέτηση' :
                              'Κάντε κλικ για ενεργοποίηση'
                            }
                          >
                            <MealPlanStatusBadge status={plan.status} />
                          </div>
                          <MealPlanTypeBadge type={plan.type} />
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <CardDescription className="mb-4 text-sm">
                        {plan.notes && plan.notes.length > 80 
                          ? `${plan.notes.substring(0, 80)}...` 
                          : plan.notes || 'Χωρίς περιγραφή'}
                      </CardDescription>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <span>Δημιουργήθηκε: {formatDate(plan.created_at)}</span>
                        {plan.start_date && (
                          <span>Έναρξη: {formatDate(plan.start_date)}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`/plan/${plan.share_token}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/meal-plans/edit/${plan.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShare(plan)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => setPlanToDelete(plan)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Διαγραφή
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client History Section */}
        <ClientHistorySection clientId={client.id} />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Επιβεβαίωση Διαγραφής</AlertDialogTitle>
            <AlertDialogDescription>
              Είστε σίγουροι ότι θέλετε να διαγράψετε το πρόγραμμα <strong>"{planToDelete?.title}"</strong>;
              Αυτή η ενέργεια δεν μπορεί να αναιρεθεί και θα διαγραφούν όλα τα σχετικά δεδομένα.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => planToDelete && handleDeletePlan(planToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Διαγραφή
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default ClientProfile;