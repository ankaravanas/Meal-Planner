import React, { useState, useEffect, useMemo } from 'react';
import { Search, UtensilsCrossed, X, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RecipeService, Recipe, RecipeMeta } from '@/services/recipeService';
import { toast } from 'sonner';

const CATEGORY_ORDER = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner'];
const ITEMS_PER_PAGE = 24;

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    breakfast: '#f97316',      // orange
    morning_snack: '#22c55e',  // green
    lunch: '#3b82f6',          // blue
    afternoon_snack: '#22c55e', // green
    dinner: '#8b5cf6',         // purple
  };
  return colors[category] || '#64748b';
};

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [meta, setMeta] = useState<RecipeMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUnique, setShowUnique] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRecipes();
  }, [showUnique]);

  const loadRecipes = async () => {
    setIsLoading(true);
    try {
      const result = showUnique
        ? await RecipeService.getUniqueRecipes()
        : await RecipeService.getRecipes();
      setRecipes(result.recipes);
      setMeta(result.meta);
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast.error('Σφάλμα κατά τη φόρτωση των συνταγών');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter recipes based on search and category
  const filteredRecipes = useMemo(() => {
    let result = recipes;

    if (selectedCategory !== 'all') {
      result = result.filter(r => r.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.text.toLowerCase().includes(query) ||
        r.clientName.toLowerCase().includes(query)
      );
    }

    return result;
  }, [recipes, selectedCategory, searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, showUnique]);

  // Pagination
  const totalPages = Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE);
  const paginatedRecipes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRecipes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRecipes, currentPage]);

  if (isLoading) {
    return (
      <DashboardLayout
        title="Συνταγές"
        subtitle="Βιβλιοθήκη γευμάτων"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Συνταγές' },
        ]}
      >
        <div className="space-y-6">
          {/* Filter bar skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[140px]" />
            </div>
          </div>
          {/* Cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="shadow-soft border-border/50">
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-16 rounded-full mb-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Συνταγές"
      subtitle={`${filteredRecipes.length} γεύματα`}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Συνταγές' },
      ]}
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Αναζήτηση γευμάτων..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Category Select */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Κατηγορία" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Όλες ({recipes.length})</SelectItem>
                {meta?.categories
                  .sort((a, b) => CATEGORY_ORDER.indexOf(a.name) - CATEGORY_ORDER.indexOf(b.name))
                  .map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.greekName} ({cat.count})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Unique/All Toggle */}
            <ToggleGroup
              type="single"
              value={showUnique ? 'unique' : 'all'}
              onValueChange={(value) => {
                if (value) setShowUnique(value === 'unique');
              }}
              className="bg-muted rounded-lg p-1"
            >
              <ToggleGroupItem
                value="unique"
                className="text-xs px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                Μοναδικά
              </ToggleGroupItem>
              <ToggleGroupItem
                value="all"
                className="text-xs px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                Όλα
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Results */}
        {filteredRecipes.length === 0 ? (
          <Card className="shadow-soft border-border/50">
            <CardContent className="py-12 text-center">
              <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Δεν βρέθηκαν γεύματα</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Δοκιμάστε διαφορετικούς όρους αναζήτησης'
                  : 'Δεν υπάρχουν γεύματα σε αυτή την κατηγορία'}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Καθαρισμός αναζήτησης
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Σελίδα {currentPage} από {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
  const hasMacros = recipe.calories || recipe.protein || recipe.carbs || recipe.fats;

  return (
    <Card className="group h-full flex flex-col shadow-soft border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-200">
      <CardContent className="p-4 flex flex-col flex-1">
        {/* Category badge */}
        <Badge
          variant="outline"
          className="w-fit mb-3 text-xs font-normal"
          style={{ borderColor: getCategoryColor(recipe.category) }}
        >
          {recipe.categoryGreek}
        </Badge>

        {/* Recipe text - hero */}
        <p className="text-sm leading-relaxed flex-1 line-clamp-4 group-hover:line-clamp-none transition-all">
          {recipe.text}
        </p>

        {/* Macros row */}
        {hasMacros && (
          <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {recipe.calories && (
              <span>
                <strong className="text-foreground">{recipe.calories}</strong> kcal
              </span>
            )}
            {recipe.protein && (
              <span>
                <strong className="text-foreground">{recipe.protein}g</strong> P
              </span>
            )}
            {recipe.carbs && (
              <span>
                <strong className="text-foreground">{recipe.carbs}g</strong> C
              </span>
            )}
            {recipe.fats && (
              <span>
                <strong className="text-foreground">{recipe.fats}g</strong> F
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Recipes;
