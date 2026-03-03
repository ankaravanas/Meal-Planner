import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Ruler, Scale, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

interface BodyMeasurement {
  id: string;
  height_cm: number | null;
  weight_kg: number | null;
  measured_at: string;
  notes: string | null;
  created_at: string;
}

interface BodyMeasurementsSectionProps {
  clientId: string;
}

export default function BodyMeasurementsSection({ clientId }: BodyMeasurementsSectionProps) {
  const { toast } = useToast();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({
    height_cm: '',
    weight_kg: '',
    measured_at: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  useEffect(() => {
    fetchMeasurements();
  }, [clientId]);

  const fetchMeasurements = async () => {
    const { data, error } = await supabase
      .from('client_body_measurements')
      .select('*')
      .eq('client_id', clientId)
      .order('measured_at', { ascending: false });

    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία φόρτωσης μετρήσεων',
        variant: 'destructive'
      });
      return;
    }

    setMeasurements(data || []);
    setIsLoading(false);
  };

  const handleAddMeasurement = async () => {
    if (!newMeasurement.height_cm && !newMeasurement.weight_kg) {
      toast({
        title: 'Σφάλμα',
        description: 'Συμπληρώστε τουλάχιστον ένα πεδίο (ύψος ή βάρος)',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await supabase
      .from('client_body_measurements')
      .insert({
        client_id: clientId,
        height_cm: newMeasurement.height_cm ? parseFloat(newMeasurement.height_cm) : null,
        weight_kg: newMeasurement.weight_kg ? parseFloat(newMeasurement.weight_kg) : null,
        measured_at: newMeasurement.measured_at,
        notes: newMeasurement.notes || null
      });

    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία αποθήκευσης μέτρησης',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Επιτυχία',
      description: 'Η μέτρηση αποθηκεύτηκε'
    });

    setNewMeasurement({
      height_cm: '',
      weight_kg: '',
      measured_at: format(new Date(), 'yyyy-MM-dd'),
      notes: ''
    });
    setIsAdding(false);
    fetchMeasurements();
  };

  const handleDeleteMeasurement = async (id: string) => {
    const { error } = await supabase
      .from('client_body_measurements')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία διαγραφής μέτρησης',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Επιτυχία',
      description: 'Η μέτρηση διαγράφηκε'
    });

    fetchMeasurements();
  };

  const latestMeasurement = measurements[0];

  const calculateBMI = (height: number | null, weight: number | null) => {
    if (!height || !weight) return null;
    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Σωματικές Μετρήσεις
            </CardTitle>
            <CardDescription>
              Ύψος, βάρος και ιστορικό μετρήσεων
            </CardDescription>
          </div>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Νέα Μέτρηση
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Stats */}
        {latestMeasurement && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Ύψος</p>
              <p className="text-2xl font-bold">
                {latestMeasurement.height_cm ? `${latestMeasurement.height_cm} cm` : '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Βάρος</p>
              <p className="text-2xl font-bold">
                {latestMeasurement.weight_kg ? `${latestMeasurement.weight_kg} kg` : '-'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">BMI</p>
              <p className="text-2xl font-bold">
                {calculateBMI(latestMeasurement.height_cm, latestMeasurement.weight_kg) || '-'}
              </p>
            </div>
          </div>
        )}

        {/* Add New Measurement Form */}
        {isAdding && (
          <div className="p-4 border rounded-lg space-y-4 bg-background">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Ύψος (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="π.χ. 175"
                  value={newMeasurement.height_cm}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, height_cm: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="weight">Βάρος (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="π.χ. 72.5"
                  value={newMeasurement.weight_kg}
                  onChange={(e) => setNewMeasurement({ ...newMeasurement, weight_kg: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="measured_at">Ημερομηνία Μέτρησης</Label>
              <Input
                id="measured_at"
                type="date"
                value={newMeasurement.measured_at}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, measured_at: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="measurement_notes">Σημειώσεις</Label>
              <Input
                id="measurement_notes"
                placeholder="Προαιρετικές σημειώσεις..."
                value={newMeasurement.notes}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Ακύρωση
              </Button>
              <Button onClick={handleAddMeasurement}>
                Αποθήκευση
              </Button>
            </div>
          </div>
        )}

        {/* Measurement History */}
        {measurements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Ιστορικό Μετρήσεων</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {measurements.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {format(new Date(m.measured_at), 'd MMM yyyy', { locale: el })}
                    </span>
                    <div className="flex items-center gap-3">
                      {m.height_cm && (
                        <span className="flex items-center gap-1">
                          <Ruler className="h-3 w-3" />
                          {m.height_cm} cm
                        </span>
                      )}
                      {m.weight_kg && (
                        <span className="flex items-center gap-1">
                          <Scale className="h-3 w-3" />
                          {m.weight_kg} kg
                        </span>
                      )}
                    </div>
                    {m.notes && (
                      <span className="text-muted-foreground italic">{m.notes}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteMeasurement(m.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && measurements.length === 0 && !isAdding && (
          <p className="text-center text-muted-foreground py-4">
            Δεν υπάρχουν καταγεγραμμένες μετρήσεις
          </p>
        )}
      </CardContent>
    </Card>
  );
}