import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import BodyMeasurementsSection from '@/components/clients/BodyMeasurementsSection';

const dietaryRestrictionOptions = [
  'Χωρίς γλουτένη',
  'Χωρίς γαλακτοκομικά',
  'Χορτοφαγικό',
  'Vegan',
  'Χωρίς ζάχαρη',
  'Χαμηλά υδατάνθρακες'
];

export default function ClientFormEnhanced() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    special_instructions: '',
    dietary_restrictions: [] as string[],
    medical_conditions: '',
    goals: '',
    food_preferences: ''
  });

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία φόρτωσης δεδομένων πελάτη',
        variant: 'destructive'
      });
      return;
    }

    if (data) {
      setFormData({
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        notes: data.notes || '',
        special_instructions: data.special_instructions || '',
        dietary_restrictions: data.dietary_restrictions || [],
        medical_conditions: data.medical_conditions || '',
        goals: data.goals || '',
        food_preferences: data.food_preferences || ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (id) {
        // Update
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Επιτυχία',
          description: 'Ο πελάτης ενημερώθηκε επιτυχώς'
        });
      } else {
        // Create
        const { error } = await supabase
          .from('clients')
          .insert(formData);

        if (error) throw error;

        toast({
          title: 'Επιτυχία',
          description: 'Ο πελάτης δημιουργήθηκε επιτυχώς'
        });
      }

      navigate('/clients');
    } catch (error: any) {
      toast({
        title: 'Σφάλμα',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRestriction = (restriction: string) => {
    if (formData.dietary_restrictions.includes(restriction)) {
      setFormData({
        ...formData,
        dietary_restrictions: formData.dietary_restrictions.filter(r => r !== restriction)
      });
    } else {
      setFormData({
        ...formData,
        dietary_restrictions: [...formData.dietary_restrictions, restriction]
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/clients')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {id ? 'Επεξεργασία Πελάτη' : 'Νέος Πελάτης'}
            </h1>
            <p className="text-muted-foreground">
              {id ? 'Ενημερώστε τα στοιχεία του πελάτη' : 'Προσθέστε έναν νέο πελάτη'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Βασικά Στοιχεία</CardTitle>
              <CardDescription>Βασικές πληροφορίες επικοινωνίας</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Όνομα *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Τηλέφωνο</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Σημειώσεις</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Γενικές σημειώσεις για τον πελάτη..."
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Context */}
          <Card>
            <CardHeader>
              <CardTitle>Πλαίσιο AI</CardTitle>
              <CardDescription>
                Αυτές οι πληροφορίες χρησιμοποιούνται αυτόματα κατά τη δημιουργία διατροφών με AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="special_instructions">Ειδικές Οδηγίες</Label>
                <Textarea
                  id="special_instructions"
                  value={formData.special_instructions}
                  onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                  placeholder="Ειδικές διατροφικές ανάγκες, προτιμήσεις..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label>Διατροφικοί Περιορισμοί</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dietaryRestrictionOptions.map(restriction => (
                    <Badge
                      key={restriction}
                      variant={formData.dietary_restrictions.includes(restriction) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleRestriction(restriction)}
                    >
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="medical_conditions">Ιατρικές Καταστάσεις</Label>
                <Textarea
                  id="medical_conditions"
                  value={formData.medical_conditions}
                  onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                  placeholder="Αλλεργίες, ιατρικές καταστάσεις..."
                />
              </div>

              <div>
                <Label htmlFor="goals">Στόχοι</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  placeholder="Στόχοι πελάτη..."
                />
              </div>

              <div>
                <Label htmlFor="food_preferences">Προτιμήσεις Τροφίμων</Label>
                <Textarea
                  id="food_preferences"
                  value={formData.food_preferences}
                  onChange={(e) => setFormData({ ...formData, food_preferences: e.target.value })}
                  placeholder="Αγαπημένα ή μη αγαπημένα τρόφιμα..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Body Measurements - Only show when editing existing client */}
          {id && <BodyMeasurementsSection clientId={id} />}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/clients')}
              disabled={isLoading}
            >
              Ακύρωση
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
