import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableRowActions
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  AlertDialogIcon,
} from '@/components/ui/alert-dialog';
import { SearchFilter } from '@/components/ui/search-filter';
import { DataPagination, usePagination } from '@/components/ui/data-pagination';
import { ClientsEmptyState, NoResultsState } from '@/components/ui/empty-state';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  FileText,
  Phone,
  Mail,
  User,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/mealPlan.types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ClientsSkeletonLoader } from '@/components/ui/skeleton-loader';

const Clients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [sortField, setSortField] = useState<'name' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { currentPage, totalPages, paginatedItems, setCurrentPage, totalItems } = usePagination(filteredClients, 10);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    let filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm)
    );

    // Sort
    filtered.sort((a, b) => {
      if (sortField === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredClients(filtered);
  }, [clients, searchTerm, sortField, sortOrder]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone, notes, created_at, updated_at')
        .order('name');

      if (error) throw error;
      
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Σφάλμα φόρτωσης",
        description: "Δεν ήταν δυνατή η φόρτωση των πελατών",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (client: Client) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      setClients(clients.filter(c => c.id !== client.id));
      setClientToDelete(null);
      
      toast({
        title: "Επιτυχής διαγραφή",
        description: `Ο πελάτης ${client.name} διαγράφηκε επιτυχώς`,
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Σφάλμα διαγραφής",
        description: "Δεν ήταν δυνατή η διαγραφή του πελάτη",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleSort = (field: 'name' | 'created_at') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Διαχείριση Πελατών"
        subtitle="Φόρτωση..."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Πελάτες' }]}
      >
        <ClientsSkeletonLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Διαχείριση Πελατών"
      subtitle={`${clients.length} πελάτες συνολικά`}
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Πελάτες' }]}
      actions={
        <Button onClick={() => navigate('/clients/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Νέος Πελάτης
        </Button>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Σύνολο Πελατών</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Αποτελέσματα</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-secondary/30 flex items-center justify-center">
              <User className="h-4 w-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredClients.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Νέοι Αυτή την Εβδομάδα</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter(client => {
                const clientDate = new Date(client.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return clientDate > weekAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Αναζήτηση πελάτη, email, τηλεφώνου..."
          className="max-w-md"
        />
      </div>

      {/* Clients Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          {clients.length === 0 ? (
            <ClientsEmptyState onAction={() => navigate('/clients/new')} />
          ) : filteredClients.length === 0 ? (
            <NoResultsState onClear={() => setSearchTerm('')} />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead 
                      className="cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => toggleSort('name')}
                    >
                      <span className="flex items-center gap-1.5">
                        Όνομα
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </span>
                    </TableHead>
                    <TableHead>Επικοινωνία</TableHead>
                    <TableHead className="hidden lg:table-cell">Σημειώσεις</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => toggleSort('created_at')}
                    >
                      <span className="flex items-center gap-1.5">
                        Ημερομηνία
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </span>
                    </TableHead>
                    <TableHead className="text-right w-[100px]">Ενέργειες</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((client) => (
                    <TableRow 
                      key={client.id} 
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-secondary/30 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-foreground" />
                          </div>
                          <span className="truncate">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {client.email && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{client.email}</span>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          {!client.email && !client.phone && (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {client.notes ? (
                          <div className="max-w-[250px] truncate text-sm text-muted-foreground">
                            {client.notes}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(client.created_at)}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <TableRowActions>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate(`/clients/${client.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate(`/clients/${client.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Προβολή Προφίλ
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/clients/${client.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Επεξεργασία
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/meal-plans/new?client=${client.id}`)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Νέο Πρόγραμμα
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setClientToDelete(client)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Διαγραφή
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableRowActions>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                className="border-t border-border"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogIcon variant="warning" />
            <AlertDialogTitle>Επιβεβαίωση Διαγραφής</AlertDialogTitle>
            <AlertDialogDescription>
              Είστε σίγουροι ότι θέλετε να διαγράψετε τον πελάτη <strong>{clientToDelete?.name}</strong>;
              Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => clientToDelete && handleDeleteClient(clientToDelete)}
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

export default Clients;
