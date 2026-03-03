import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Plus, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export default function AIPromptManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: ''
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία φόρτωσης προτύπων',
        variant: 'destructive'
      });
      return;
    }

    setTemplates(data || []);
    
    // Select active template by default
    const activeTemplate = data?.find(t => t.is_active);
    if (activeTemplate) {
      setSelectedTemplate(activeTemplate);
      setFormData({
        name: activeTemplate.name,
        description: activeTemplate.description || '',
        system_prompt: activeTemplate.system_prompt
      });
    }
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      system_prompt: template.system_prompt
    });
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.system_prompt) {
      toast({
        title: 'Σφάλμα',
        description: 'Το όνομα και το σύστημα prompt είναι υποχρεωτικά',
        variant: 'destructive'
      });
      return;
    }

    if (selectedTemplate && !editMode) {
      // Update existing
      const { error } = await supabase
        .from('ai_prompt_templates')
        .update({
          name: formData.name,
          description: formData.description,
          system_prompt: formData.system_prompt
        })
        .eq('id', selectedTemplate.id);

      if (error) {
        toast({
          title: 'Σφάλμα',
          description: 'Αποτυχία ενημέρωσης προτύπου',
          variant: 'destructive'
        });
        return;
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('ai_prompt_templates')
        .insert({
          name: formData.name,
          description: formData.description,
          system_prompt: formData.system_prompt,
          is_active: false,
          version: 1
        });

      if (error) {
        toast({
          title: 'Σφάλμα',
          description: 'Αποτυχία δημιουργίας προτύπου',
          variant: 'destructive'
        });
        return;
      }
    }

    toast({
      title: 'Επιτυχία',
      description: 'Το πρότυπο αποθηκεύτηκε επιτυχώς'
    });

    setEditMode(false);
    fetchTemplates();
  };

  const handleSetActive = async (templateId: string) => {
    // First, deactivate all templates
    await supabase
      .from('ai_prompt_templates')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

    // Then activate the selected one
    const { error } = await supabase
      .from('ai_prompt_templates')
      .update({ is_active: true })
      .eq('id', templateId);

    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία ενεργοποίησης προτύπου',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Επιτυχία',
      description: 'Το πρότυπο ενεργοποιήθηκε'
    });

    fetchTemplates();
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setFormData({
      name: '',
      description: '',
      system_prompt: ''
    });
    setEditMode(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Διαχείριση AI Prompts</h1>
              <p className="text-muted-foreground">
                Διαχειριστείτε τα σύστημα prompts για τη δημιουργία διατροφών
              </p>
            </div>
          </div>
          <Button onClick={handleNewTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Νέο Πρότυπο
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Αποθηκευμένα Πρότυπα</CardTitle>
                <CardDescription>
                  Επιλέξτε ένα πρότυπο για επεξεργασία
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          v{template.version}
                        </p>
                      </div>
                      {template.is_active && (
                        <Badge variant="default" className="ml-2">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Ενεργό
                        </Badge>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editMode ? 'Νέο Πρότυπο' : selectedTemplate?.name || 'Επιλέξτε Πρότυπο'}
                </CardTitle>
                <CardDescription>
                  Επεξεργαστείτε το σύστημα prompt που χρησιμοποιείται για τη δημιουργία διατροφών
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Όνομα Προτύπου</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="π.χ. Default Greek Nutritionist"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Περιγραφή</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Σύντομη περιγραφή του προτύπου"
                  />
                </div>

                <div>
                  <Label htmlFor="system_prompt">System Prompt</Label>
                  <Textarea
                    id="system_prompt"
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    placeholder="Εισάγετε το σύστημα prompt..."
                    className="min-h-[400px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Εκτιμώμενα tokens: ~{Math.ceil(formData.system_prompt.length / 4)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Αποθήκευση
                  </Button>
                  {selectedTemplate && !selectedTemplate.is_active && (
                    <Button
                      variant="outline"
                      onClick={() => handleSetActive(selectedTemplate.id)}
                    >
                      Ενεργοποίηση
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
