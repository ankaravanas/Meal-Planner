import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Loader2, Save, LogOut, Brain, Cpu,
  UtensilsCrossed, FileText, Users, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { KnowledgeBaseService, KnowledgeBaseStats } from '@/services/knowledgeBaseService';

const AI_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Recommended)', description: 'Fast and reliable' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'More economical' },
];

const Settings: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [aiModel, setAiModel] = useState('gpt-4o');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [kbStats, setKbStats] = useState<KnowledgeBaseStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
  }, []);

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
          toast.error('Error saving AI model');
          return;
        }
      }

      toast.success('AI model saved successfully');
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsSavingAI(false);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/auth');
    toast.success('Signed out successfully');
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Settings"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Application settings and configuration"
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
    >
      <div className="max-w-2xl space-y-6">
        {/* AI Settings Card */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              <CardTitle>AI Settings</CardTitle>
            </div>
            <CardDescription>
              Select the AI model for meal plan generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aiModel" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Model
              </Label>
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex flex-col">
                        <span>{model.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveAIModel} disabled={isSavingAI}>
              {isSavingAI ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Save</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Knowledge Base Stats */}
        {kbStats && (
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Knowledge Base</CardTitle>
              </div>
              <CardDescription>
                Statistics about your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{kbStats.totalClients}</p>
                    <p className="text-sm text-muted-foreground">Clients</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{kbStats.totalMealPlans}</p>
                    <p className="text-sm text-muted-foreground">Meal Plans</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{kbStats.totalMeals}</p>
                    <p className="text-sm text-muted-foreground">Meals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Sign Out */}
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-destructive" />
              <CardTitle>Sign Out</CardTitle>
            </div>
            <CardDescription>
              Exit the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
