import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Calendar, 
  Eye, 
  Edit, 
  Share2, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  Sparkles,
  CheckCircle,
  Archive,
  RotateCcw
} from "lucide-react";
import { MealPlan, Client } from "@/types/mealPlan.types";
import MealPlanStatusBadge from "./MealPlanStatusBadge";
import MealPlanTypeBadge from "./MealPlanTypeBadge";

interface MealPlanCardProps {
  plan: MealPlan & { client?: Client };
  onView: (plan: MealPlan) => void;
  onEdit: (plan: MealPlan) => void;
  onShare: (plan: MealPlan) => void;
  onDuplicate: (plan: MealPlan) => void;
  onDelete: (planId: string) => void;
  onStatusChange: (planId: string, status: 'draft' | 'active' | 'archived') => void;
}

export default function MealPlanCard({
  plan,
  onView,
  onEdit,
  onShare,
  onDuplicate,
  onDelete,
  onStatusChange,
}: MealPlanCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getNextStatus = (current: 'draft' | 'active' | 'archived') => {
    switch (current) {
      case 'draft': return 'active';
      case 'active': return 'archived';
      case 'archived': return 'active';
    }
  };

  const getStatusActionLabel = (current: 'draft' | 'active' | 'archived') => {
    switch (current) {
      case 'draft': return 'Ενεργοποίηση';
      case 'active': return 'Αρχειοθέτηση';
      case 'archived': return 'Επαναφορά';
    }
  };

  const getStatusActionIcon = (current: 'draft' | 'active' | 'archived') => {
    switch (current) {
      case 'draft': return CheckCircle;
      case 'active': return Archive;
      case 'archived': return RotateCcw;
    }
  };

  const StatusActionIcon = getStatusActionIcon(plan.status);

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Title with AI badge inline */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {plan.ai_generated && (
                <Badge variant="secondary" className="gap-1 text-xs bg-primary/10 text-primary border-0 flex-shrink-0">
                  <Sparkles className="h-3 w-3" />
                  AI
                </Badge>
              )}
              <h3 className="font-semibold text-foreground truncate">
                {plan.title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{plan.client?.name || 'Άγνωστος πελάτης'}</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView(plan)}>
                <Eye className="h-4 w-4 mr-2" />
                Προβολή
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(plan)}>
                <Edit className="h-4 w-4 mr-2" />
                Επεξεργασία
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(plan)}>
                <Share2 className="h-4 w-4 mr-2" />
                Κοινοποίηση
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(plan)}>
                <Copy className="h-4 w-4 mr-2" />
                Αντιγραφή
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onStatusChange(plan.id, getNextStatus(plan.status))}>
                <StatusActionIcon className="h-4 w-4 mr-2" />
                {getStatusActionLabel(plan.status)}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(plan.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Διαγραφή
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-4">
          <MealPlanStatusBadge status={plan.status} />
          <MealPlanTypeBadge type={plan.type} />
        </div>

        {/* Notes preview */}
        {plan.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {plan.notes}
          </p>
        )}

        {/* Date info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(plan.created_at)}</span>
          </div>
          {plan.start_date && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground/70">Έναρξη:</span>
              <span>{formatDate(plan.start_date)}</span>
            </div>
          )}
        </div>

        {/* Quick actions - always visible */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(plan)}
            className="flex-1 h-9"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Προβολή
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShare(plan)}
            className="h-9"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(plan)}
            className="h-9"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
