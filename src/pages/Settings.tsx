import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Loader2, User, Mail, Save, LogOut, Shield, Brain, Cpu,
  UtensilsCrossed, FileText, Users, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { KnowledgeBaseService, KnowledgeBaseStats } from '@/services/knowledgeBaseService';

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Recommended)', description: 'Γρήγορο και αξιόπιστο' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Πιο οικονομικό' },
];

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [aiModel, setAiModel] = useState('gpt-4o');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [kbStats, setKbStats] = useState<KnowledgeBaseStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: profileData } = await supabase
          .from('admin_profiles')
          .select('display_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData) {
          setDisplayName(profileData.display_name || '');
        }

        const { data: settingsData } = await supabase
          .from('app_settings')
          .select('ai_model')
          .eq('id', 'default')
          .maybeSingle();

        if (settingsData) {
          setAiModel(settingsData.ai_model || 'gpt-4o');
        }

        const stats = await KnowledgeBaseService.getStats().catch(() => null);
        setKbStats(stats);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('admin_profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', user.id);

      if (error) {
        toast.error('Σφάλμα κατά την αποθήκευση του προφίλ');
      } else {
        toast.success('Το προφίλ αποθηκεύτηκε επιτυχώς');
      }
    } catch (err) {
      toast.error('Προέκυψε ένα σφάλμα');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAIModel = async () => {
    setIsSavingAI(true);

    try {
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({ ai_model: aiModel })
        .eq('id', 'default');

      if (updateError) {
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert({ id: 'default', ai_model: aiModel });

        if (insertError) {
          toast.error('Σφάλμα κατά την αποθήκευση του μοντέλου AI');
          return;
        }
      }

      toast.success('Το μοντέλο AI αποθηκεύτηκε επιτυχώς');
    } catch (err) {
      toast.error('Προέκυψε ένα σφάλμα');
    } finally {
      setIsSavingAI(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
    toast.success('Αποσυνδεθήκατε επιτυχώς');
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Ρυθμίσεις"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Ρυθμίσεις' }]}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Ρυθμίσεις"
      subtitle="Διαχείριση λογαριασμού και ρυθμίσεων"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Ρυθμίσεις' }]}
    >
      <div className="max-w-2xl space-y-6">
        {/* Profile Card */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Προφίλ Διαχειριστή</CardTitle>
            </div>
            <CardDescription>
              Διαχειριστείτε τις πληροφορίες του λογαριασμού σας
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Όνομα Εμφάνισης
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="π.χ. Κατερίνα"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={100}
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Αποθήκευση...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Αποθήκευση</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* AI Settings Card */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              <CardTitle>Ρυθμίσεις AI</CardTitle>
            </div>
            <CardDescription>
              Επιλέξτε το μοντέλο AI για τη δημιουργία διατροφικών προγραμμάτων
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aiModel" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Μοντέλο AI
              </Label>
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε μοντέλο" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex flex-col">
                        <span>{model.label}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveAIModel} disabled={isSavingAI}>
              {isSavingAI ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Αποθήκευση...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Αποθήκευση AI</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Knowledge Base Stats */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Στατιστικά Δεδομένων</CardTitle>
            </div>
            <CardDescription>
              Επισκόπηση των δεδομένων στο σύστημα
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <UtensilsCrossed className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{kbStats?.totalMeals || 0}</p>
                <p className="text-sm text-muted-foreground">Γεύματα</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <FileText className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{kbStats?.totalPlans || 0}</p>
                <p className="text-sm text-muted-foreground">Προγράμματα</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{kbStats?.totalClients || 0}</p>
                <p className="text-sm text-muted-foreground">Πελάτες</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Ασφάλεια</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Μέθοδος Σύνδεσης</h4>
              <p className="text-sm text-muted-foreground">Magic Link authentication</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle>Άλλες Ρυθμίσεις</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/settings/ai-prompts">
                <Brain className="mr-2 h-4 w-4" />
                Διαχείριση AI Prompts
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Logout */}
        <Card className="border-destructive/20 shadow-soft">
          <CardContent className="pt-6">
            <Button variant="destructive" onClick={handleLogout} className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Αποσύνδεση
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
