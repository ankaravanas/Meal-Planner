import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Sparkles, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AIService } from '@/services/aiService';
import { Client, MealPlan, AIGenerationRequest, AIGenerationResponse } from '@/types/mealPlan.types';

interface AIGenerationModalProps {
  isOpen: boolean;
  client: Client | null;
  previousPlan?: MealPlan;
  onGenerate: (generatedPlan: AIGenerationResponse) => void;
  onClose: () => void;
}

const AIGenerationModal: React.FC<AIGenerationModalProps> = ({
  isOpen,
  client,
  previousPlan,
  onGenerate,
  onClose,
}) => {
  const [planType, setPlanType] = useState<'flexible' | 'structured'>('flexible');
  const [modifications, setModifications] = useState('');
  const [preferences, setPreferences] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [weekNumber, setWeekNumber] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const dietaryRestrictions = [
    'Χωρίς γλουτένη',
    'Χωρίς λακτόζη',
    'Χωρίς ζάχαρη',
    'Χορτοφαγικό',
    'Βίγκαν',
    'Χαμηλά υδατάνθρακες',
    'Υψηλή πρωτεΐνη',
    'Χωρίς ξηρούς καρπούς',
    'Χωρίς θαλασσινά',
  ];

  const handleRestrictionChange = (restriction: string, checked: boolean) => {
    if (checked) {
      setSelectedRestrictions([...selectedRestrictions, restriction]);
    } else {
      setSelectedRestrictions(selectedRestrictions.filter(r => r !== restriction));
    }
  };

  const handleGenerate = async () => {
    if (!client) return;
    
    setIsGenerating(true);

    try {
      const request: AIGenerationRequest = {
        clientName: client.name,
        planType,
        previousPlan,
        modifications: modifications.trim() ? modifications.split('\n').filter(m => m.trim()) : undefined,
        dietaryRestrictions: selectedRestrictions.length > 0 ? selectedRestrictions : undefined,
        preferences: preferences.trim() ? preferences.split('\n').filter(p => p.trim()) : undefined,
        weekNumber: planType === 'structured' ? weekNumber : undefined,
      };

      const response = await AIService.generateMealPlan(request);

      if (response.success && response.mealPlan) {
        toast({
          title: "Επιτυχής δημιουργία!",
          description: "Το διατροφικό πρόγραμμα δημιουργήθηκε με AI",
        });
        onGenerate(response);
      } else {
        throw new Error(response.error || 'Αποτυχία δημιουργίας προγράμματος');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      const errorMessage = AIService.handleAIError(error);
      
      toast({
        title: "Σφάλμα δημιουργίας",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setPlanType('flexible');
    setModifications('');
    setPreferences('');
    setSelectedRestrictions([]);
    setWeekNumber(1);
    setIsGenerating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Δημιουργία Προγράμματος με AI
          </DialogTitle>
          <DialogDescription>
            Δημιουργήστε ένα εξατομικευμένο διατροφικό πρόγραμμα για τον/την {client?.name || 'επιλεγμένο πελάτη'} χρησιμοποιώντας τεχνητή νοημοσύνη
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Τύπος Προγράμματος</Label>
            <RadioGroup value={planType} onValueChange={(value: 'flexible' | 'structured') => setPlanType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="flexible" id="flexible" />
                <Label htmlFor="flexible" className="cursor-pointer">
                  Ελεύθερη Επιλογή - Επιλογές ανά κατηγορία γεύματος
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="structured" id="structured" />
                <Label htmlFor="structured" className="cursor-pointer">
                  Συγκεκριμένα Γεύματα - Δομημένο εβδομαδιαίο πρόγραμμα
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Week Number for Structured Plans */}
          {planType === 'structured' && (
            <div className="space-y-2">
              <Label htmlFor="weekNumber">Αριθμός Εβδομάδας</Label>
              <RadioGroup value={weekNumber.toString()} onValueChange={(value) => setWeekNumber(parseInt(value))}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="week1" />
                  <Label htmlFor="week1">Εβδομάδα 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="week2" />
                  <Label htmlFor="week2">Εβδομάδα 2</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Dietary Restrictions */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Διαιτητικοί Περιορισμοί</Label>
            <div className="grid grid-cols-2 gap-3">
              {dietaryRestrictions.map((restriction) => (
                <div key={restriction} className="flex items-center space-x-2">
                  <Checkbox
                    id={restriction}
                    checked={selectedRestrictions.includes(restriction)}
                    onCheckedChange={(checked) => handleRestrictionChange(restriction, checked as boolean)}
                  />
                  <Label htmlFor={restriction} className="text-sm cursor-pointer">
                    {restriction}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Modifications */}
          <div className="space-y-2">
            <Label htmlFor="modifications">Ειδικές Τροποποιήσεις ή Αιτήματα</Label>
            <Textarea
              id="modifications"
              placeholder="π.χ. Περισσότερα ψάρια, λιγότερα κρέατα, εποχιακά προϊόντα..."
              value={modifications}
              onChange={(e) => setModifications(e.target.value)}
              rows={3}
            />
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <Label htmlFor="preferences">Προτιμήσεις Πελάτη</Label>
            <Textarea
              id="preferences"
              placeholder="π.χ. Αγαπάει τα όσπρια, δεν προτιμά τα γλυκά, θέλει γρήγορα γεύματα..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              rows={3}
            />
          </div>

          {/* Previous Plan Info */}
          {previousPlan && (
            <div className="p-4 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Προηγούμενο Πρόγραμμα:</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {previousPlan.title} ({previousPlan.type === 'flexible' ? 'Ελεύθερη Επιλογή' : 'Συγκεκριμένα Γεύματα'})
              </p>
              <p className="text-xs text-muted-foreground">
                Το AI θα λάβει υπόψη το προηγούμενο πρόγραμμα για να δημιουργήσει ποικιλία
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
            Ακύρωση
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !client}>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIGenerationModal;