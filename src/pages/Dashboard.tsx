import React, { useState, useEffect } from 'react';
import {
  Users,
  UtensilsCrossed,
  Search,
  UserPlus,
  Plus,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface Client {
  id: string;
  name: string;
  created_at: string;
}

interface MealPlan {
  id: string;
  title: string;
  status: string;
  start_date: string | null;
  created_at: string;
  client_id: string | null;
  client?: { name: string } | null;
}

interface DashboardStats {
  activeClients: number;
  activePlans: number; // Number of active clients with at least one meal plan
  loading: boolean;
}

interface RecentClient {
  id: string;
  name: string;
  planCount: number;
  lastUpdated: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    activeClients: 0,
    activePlans: 0,
    loading: true
  });
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<{ id: string; name: string }[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    loadRecentSearches();

    // Subscribe to real-time updates for clients and meal_plans
    const clientsChannel = supabase
      .channel('dashboard-clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const plansChannel = supabase
      .channel('dashboard-plans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_plans' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(plansChannel);
    };
  }, []);

  const loadRecentSearches = () => {
    const stored = localStorage.getItem('recentClientSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 3));
      } catch {
        setRecentSearches([]);
      }
    }
  };

  const saveRecentSearch = (client: { id: string; name: string }) => {
    const stored = localStorage.getItem('recentClientSearches');
    let searches = stored ? JSON.parse(stored) : [];
    searches = [client, ...searches.filter((s: { id: string }) => s.id !== client.id)].slice(0, 3);
    localStorage.setItem('recentClientSearches', JSON.stringify(searches));
    setRecentSearches(searches);
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch active clients count (is_active = true)
      const { count: activeClientsCount, error: countError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // If is_active column doesn't exist, fall back to counting all clients
      let activeClients = activeClientsCount || 0;
      if (countError) {
        const { count: totalCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true });
        activeClients = totalCount || 0;
      }

      // Fetch all active clients (just IDs) to count those with meal plans
      const { data: allActiveClients } = await supabase
        .from('clients')
        .select('id')
        .eq('is_active', true);

      // Fetch recent clients for display (limited to 5)
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name, created_at, is_active')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch all meal plans
      const { data: mealPlans, error: plansError } = await supabase
        .from('meal_plans')
        .select('id, client_id, created_at');

      if (plansError) throw plansError;

      // Active plans = number of active clients who have at least one meal plan
      const clientsWithPlans = new Set(mealPlans?.map(p => p.client_id).filter(Boolean));
      const activePlans = (allActiveClients || []).filter(c => clientsWithPlans.has(c.id)).length;

      setStats({
        activeClients,
        activePlans,
        loading: false
      });

      // Map clients to recent clients with plan count and last updated
      const clientsWithStatus: RecentClient[] = (clients || []).map(client => {
        const clientPlans = mealPlans?.filter(p => p.client_id === client.id) || [];
        // Find the most recently updated plan
        const latestPlan = clientPlans.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        return {
          id: client.id,
          name: client.name,
          planCount: clientPlans.length,
          lastUpdated: latestPlan?.created_at || null,
        };
      });

      setRecentClients(clientsWithStatus);
      setClientsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
      setClientsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      const { data } = await supabase
        .from('clients')
        .select('id, name')
        .ilike('name', `%${searchQuery}%`)
        .limit(1)
        .single();
      
      if (data) {
        saveRecentSearch({ id: data.id, name: data.name });
        navigate(`/clients/${data.id}`);
      }
    } catch {
      // Navigate to clients page with search
      navigate(`/clients?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <DashboardLayout
      title="Καλώς ήρθες!"
      subtitle="Διαχείριση διατροφικών προγραμμάτων"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* KPI Cards - 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Active Clients Card */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Ενεργοί Πελάτες</p>
                {stats.loading ? (
                  <Skeleton className="h-10 w-16 mb-2" />
                ) : (
                  <p className="text-4xl font-bold text-foreground mb-2">{stats.activeClients}</p>
                )}
              </div>
            </div>
          </div>

          {/* Active Plans Card */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <UtensilsCrossed className="h-8 w-8 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">Ενεργά Προγράμματα</p>
                {stats.loading ? (
                  <Skeleton className="h-10 w-16 mb-2" />
                ) : (
                  <p className="text-4xl font-bold text-foreground mb-2">{stats.activePlans}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Section A: Recent Clients */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Πρόσφατοι Πελάτες</h2>
              
              <div className="space-y-3">
                {clientsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-40" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  ))
                ) : recentClients.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">Δεν έχετε πελάτες ακόμα</p>
                    <Button onClick={() => navigate('/clients/new')}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Προσθήκη Πελάτη
                    </Button>
                  </div>
                ) : (
                  recentClients.map((client) => (
                    <div
                      key={client.id}
                      className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-secondary transition-all duration-200 cursor-pointer"
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">{client.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {client.planCount === 0
                              ? 'Χωρίς προγράμματα'
                              : `${client.planCount} ${client.planCount === 1 ? 'πρόγραμμα' : 'προγράμματα'}`}
                          </p>
                        </div>
                        {client.lastUpdated && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(client.lastUpdated).toLocaleDateString('el-GR', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {recentClients.length > 0 && (
                <button
                  onClick={() => navigate('/clients')}
                  className="mt-4 text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
                >
                  Δες όλους τους πελάτες
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </section>

          </div>

          {/* Right Column - Sticky */}
          <div className="lg:sticky lg:top-24 space-y-6 h-fit">
            {/* Section C: Quick Search */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Γρήγορη Αναζήτηση</h3>
              
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Αναζήτηση πελάτη..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>
              
              {recentSearches.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs uppercase font-medium text-muted-foreground tracking-wide mb-2">
                    Πρόσφατα:
                  </p>
                  <div className="space-y-2">
                    {recentSearches.map((search) => (
                      <button
                        key={search.id}
                        onClick={() => {
                          saveRecentSearch(search);
                          navigate(`/clients/${search.id}`);
                        }}
                        className="block text-sm text-foreground/70 hover:text-primary hover:underline transition-colors"
                      >
                        • {search.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section D: Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Γρήγορες Ενέργειες</h3>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start gap-3 border-2 border-secondary text-foreground hover:bg-secondary hover:text-secondary-foreground transition-all duration-200"
                  onClick={() => navigate('/clients/new')}
                >
                  <UserPlus className="h-5 w-5" />
                  <span className="font-medium">Νέος Πελάτης</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start gap-3 border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  onClick={() => navigate('/meal-plans/new')}
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Νέο Πρόγραμμα</span>
                </Button>
                
                <Button
                  className="w-full h-12 justify-start gap-3 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)'
                  }}
                  onClick={() => navigate('/meal-plans/new?ai=true')}
                >
                  <Sparkles className="h-5 w-5" />
                  <span>AI Generation</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
