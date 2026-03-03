import { Calculator, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface NutritionalTargets {
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

interface NutritionalTargetsInputProps {
  targets: NutritionalTargets;
  onChange: (targets: NutritionalTargets) => void;
}

const PRESETS = {
  balanced: { name: 'Ισορροπημένη διατροφή (30/40/30)', protein: 30, carbs: 40, fats: 30 },
  highProtein: { name: 'Υψηλή πρωτεΐνη (40/30/30)', protein: 40, carbs: 30, fats: 30 },
  lowCarb: { name: 'Χαμηλοί υδατάνθρακες (35/25/40)', protein: 35, carbs: 25, fats: 40 },
  custom: { name: 'Προσαρμοσμένο', protein: 0, carbs: 0, fats: 0 }
};

export default function NutritionalTargetsInput({ targets, onChange }: NutritionalTargetsInputProps) {
  const calculateMacroCalories = () => {
    const proteinCal = (targets.protein || 0) * 4;
    const carbsCal = (targets.carbs || 0) * 4;
    const fatsCal = (targets.fats || 0) * 9;
    return proteinCal + carbsCal + fatsCal;
  };

  const calculatePercentages = () => {
    const total = calculateMacroCalories();
    if (total === 0) return null;
    
    return {
      protein: Math.round(((targets.protein || 0) * 4 / total) * 100),
      carbs: Math.round(((targets.carbs || 0) * 4 / total) * 100),
      fats: Math.round(((targets.fats || 0) * 9 / total) * 100)
    };
  };

  const hasCalorieMismatch = () => {
    if (!targets.calories || (!targets.protein && !targets.carbs && !targets.fats)) {
      return false;
    }
    const macroTotal = calculateMacroCalories();
    const diff = Math.abs(macroTotal - targets.calories);
    return diff > targets.calories * 0.15; // 15% tolerance
  };

  const applyPreset = (presetKey: string) => {
    if (presetKey === 'custom' || !targets.calories) return;
    
    const preset = PRESETS[presetKey as keyof typeof PRESETS];
    const protein = Math.round((targets.calories * (preset.protein / 100)) / 4);
    const carbs = Math.round((targets.calories * (preset.carbs / 100)) / 4);
    const fats = Math.round((targets.calories * (preset.fats / 100)) / 9);
    
    onChange({ ...targets, protein, carbs, fats });
  };

  const percentages = calculatePercentages();

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4" />
          Θρεπτικοί Στόχοι
        </CardTitle>
        <CardDescription>
          Προαιρετικά πεδία για ακριβή διατροφική στόχευση
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="calories">Ημερήσιες Θερμίδες</Label>
          <div className="flex items-center gap-2">
            <Input
              id="calories"
              type="number"
              value={targets.calories || ''}
              onChange={(e) => onChange({ ...targets, calories: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="π.χ. 1800"
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">kcal</span>
          </div>
        </div>

        {targets.calories && (
          <div>
            <Label>Χρήση προτύπου</Label>
            <Select onValueChange={applyPreset}>
              <SelectTrigger>
                <SelectValue placeholder="Προσαρμοσμένο" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{PRESETS.custom.name}</SelectItem>
                <SelectItem value="balanced">{PRESETS.balanced.name}</SelectItem>
                <SelectItem value="highProtein">{PRESETS.highProtein.name}</SelectItem>
                <SelectItem value="lowCarb">{PRESETS.lowCarb.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Κατανομή Μακροθρεπτικών</Label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div>
              <Label htmlFor="protein" className="text-xs">Πρωτεΐνες</Label>
              <div className="flex items-center gap-1">
                <Input
                  id="protein"
                  type="number"
                  value={targets.protein || ''}
                  onChange={(e) => onChange({ ...targets, protein: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="120"
                  className="text-sm"
                />
                <span className="text-xs text-muted-foreground">γρ</span>
              </div>
            </div>
            <div>
              <Label htmlFor="carbs" className="text-xs">Υδατάνθρακες</Label>
              <div className="flex items-center gap-1">
                <Input
                  id="carbs"
                  type="number"
                  value={targets.carbs || ''}
                  onChange={(e) => onChange({ ...targets, carbs: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="200"
                  className="text-sm"
                />
                <span className="text-xs text-muted-foreground">γρ</span>
              </div>
            </div>
            <div>
              <Label htmlFor="fats" className="text-xs">Λίπη</Label>
              <div className="flex items-center gap-1">
                <Input
                  id="fats"
                  type="number"
                  value={targets.fats || ''}
                  onChange={(e) => onChange({ ...targets, fats: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="60"
                  className="text-sm"
                />
                <span className="text-xs text-muted-foreground">γρ</span>
              </div>
            </div>
          </div>
        </div>

        {percentages && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Κατανομή: Πρωτεΐνες {percentages.protein}% · Υδατάνθρακες {percentages.carbs}% · Λίπη {percentages.fats}%</p>
            <p>Συνολικές θερμίδες από μακροθρεπτικά: ~{calculateMacroCalories()} kcal</p>
          </div>
        )}

        {hasCalorieMismatch() && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Προσοχή: Τα μακροθρεπτικά δεν ταιριάζουν με τις θερμίδες (διαφορά {">"} 15%)
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
