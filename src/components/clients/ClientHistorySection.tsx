import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Trash2, Calendar, Tag, Pencil, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

const HISTORY_CATEGORIES = [
  { value: 'initial_consultation', label: 'Αρχική Συνεδρία' },
  { value: 'follow_up', label: 'Επανεξέταση' },
  { value: 'medical_history', label: 'Ιατρικό Ιστορικό' },
  { value: 'general', label: 'Γενικές Σημειώσεις' },
];

interface HistoryNote {
  id: string;
  client_id: string;
  note_date: string;
  category: string;
  content: string;
  source: string | null;
  original_filename: string | null;
  created_at: string;
}

interface ClientHistorySectionProps {
  clientId: string;
}

export default function ClientHistorySection({ clientId }: ClientHistorySectionProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<HistoryNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({
    note_date: format(new Date(), 'yyyy-MM-dd'),
    category: 'general',
    content: ''
  });
  const [editNote, setEditNote] = useState({
    note_date: '',
    category: '',
    content: ''
  });

  useEffect(() => {
    fetchNotes();
  }, [clientId]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('client_history_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('note_date', { ascending: false });

    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία φόρτωσης ιστορικού',
        variant: 'destructive'
      });
      return;
    }

    setNotes(data || []);
    setIsLoading(false);
  };

  const handleAddNote = async () => {
    if (!newNote.content.trim()) {
      toast({
        title: 'Σφάλμα',
        description: 'Συμπληρώστε το περιεχόμενο της σημείωσης',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await supabase
      .from('client_history_notes')
      .insert({
        client_id: clientId,
        note_date: newNote.note_date,
        category: newNote.category,
        content: newNote.content.trim(),
        source: 'manual'
      });

    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία αποθήκευσης σημείωσης',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Επιτυχία',
      description: 'Η σημείωση αποθηκεύτηκε'
    });

    setNewNote({
      note_date: format(new Date(), 'yyyy-MM-dd'),
      category: 'general',
      content: ''
    });
    setIsAdding(false);
    fetchNotes();
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase
      .from('client_history_notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία διαγραφής σημείωσης',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Επιτυχία',
      description: 'Η σημείωση διαγράφηκε'
    });

    fetchNotes();
  };

  const startEditing = (note: HistoryNote) => {
    setEditingId(note.id);
    setEditNote({
      note_date: note.note_date,
      category: note.category || 'general',
      content: note.content
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditNote({ note_date: '', category: '', content: '' });
  };

  const handleSaveEdit = async () => {
    if (!editNote.content.trim()) {
      toast({
        title: 'Σφάλμα',
        description: 'Συμπληρώστε το περιεχόμενο της σημείωσης',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await supabase
      .from('client_history_notes')
      .update({
        note_date: editNote.note_date,
        category: editNote.category,
        content: editNote.content.trim()
      })
      .eq('id', editingId);

    if (error) {
      toast({
        title: 'Σφάλμα',
        description: 'Αποτυχία ενημέρωσης σημείωσης',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Επιτυχία',
      description: 'Η σημείωση ενημερώθηκε'
    });

    setEditingId(null);
    setEditNote({ note_date: '', category: '', content: '' });
    fetchNotes();
  };

  const getCategoryLabel = (value: string) => {
    const category = HISTORY_CATEGORIES.find(c => c.value === value);
    return category ? category.label : value;
  };

  const getCategoryColor = (value: string) => {
    switch (value) {
      case 'initial_consultation':
        return 'bg-blue-100 text-blue-800';
      case 'follow_up':
        return 'bg-green-100 text-green-800';
      case 'medical_history':
        return 'bg-red-100 text-red-800';
      case 'general':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ιστορικό Πελάτη
            </CardTitle>
            <CardDescription>
              Σημειώσεις και ιστορικό συνεδριών
            </CardDescription>
          </div>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Νέα Σημείωση
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Note Form */}
        {isAdding && (
          <div className="p-4 border rounded-lg space-y-4 bg-background">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="note_date">Ημερομηνία</Label>
                <Input
                  id="note_date"
                  type="date"
                  value={newNote.note_date}
                  onChange={(e) => setNewNote({ ...newNote, note_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Κατηγορία</Label>
                <Select
                  value={newNote.category}
                  onValueChange={(value) => setNewNote({ ...newNote, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε κατηγορία" />
                  </SelectTrigger>
                  <SelectContent>
                    {HISTORY_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="content">Περιεχόμενο</Label>
              <Textarea
                id="content"
                placeholder="Γράψτε τη σημείωσή σας εδώ..."
                rows={4}
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Ακύρωση
              </Button>
              <Button onClick={handleAddNote}>
                Αποθήκευση
              </Button>
            </div>
          </div>
        )}

        {/* History List */}
        {notes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Σημειώσεις</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="p-4 bg-muted/30 rounded-lg text-sm">
                  {editingId === note.id ? (
                    /* Edit Form */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`edit_date_${note.id}`}>Ημερομηνία</Label>
                          <Input
                            id={`edit_date_${note.id}`}
                            type="date"
                            value={editNote.note_date}
                            onChange={(e) => setEditNote({ ...editNote, note_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit_category_${note.id}`}>Κατηγορία</Label>
                          <Select
                            value={editNote.category}
                            onValueChange={(value) => setEditNote({ ...editNote, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε κατηγορία" />
                            </SelectTrigger>
                            <SelectContent>
                              {HISTORY_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`edit_content_${note.id}`}>Περιεχόμενο</Label>
                        <Textarea
                          id={`edit_content_${note.id}`}
                          rows={4}
                          value={editNote.content}
                          onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={cancelEditing}>
                          <X className="h-4 w-4 mr-1" />
                          Ακύρωση
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Check className="h-4 w-4 mr-1" />
                          Αποθήκευση
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Display Note */
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(note.note_date), 'd MMM yyyy', { locale: el })}
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                            <Tag className="h-3 w-3" />
                            {getCategoryLabel(note.category)}
                          </span>
                          {note.original_filename && (
                            <span className="text-xs text-muted-foreground italic">
                              (από: {note.original_filename})
                            </span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap">{note.content}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => startEditing(note)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && notes.length === 0 && !isAdding && (
          <p className="text-center text-muted-foreground py-4">
            Δεν υπάρχουν καταγεγραμμένες σημειώσεις
          </p>
        )}
      </CardContent>
    </Card>
  );
}
