import * as React from "react";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./dropdown-menu";

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

const SearchFilter = React.forwardRef<HTMLDivElement, SearchFilterProps>(
  ({ searchValue, onSearchChange, searchPlaceholder = "Αναζήτηση...", className }, ref) => {
    const [debouncedValue, setDebouncedValue] = React.useState(searchValue);
    const timeoutRef = React.useRef<NodeJS.Timeout>();

    const handleChange = (value: string) => {
      setDebouncedValue(value);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 300);
    };

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    React.useEffect(() => {
      setDebouncedValue(searchValue);
    }, [searchValue]);

    return (
      <div ref={ref} className={cn("relative w-full", className)}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={debouncedValue}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-10 pr-10 h-11 bg-background border-border"
        />
        {debouncedValue && (
          <button
            onClick={() => {
              setDebouncedValue("");
              onSearchChange("");
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
SearchFilter.displayName = "SearchFilter";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  singleSelect?: boolean;
  className?: string;
}

const FilterDropdown = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
  singleSelect = false,
  className,
}: FilterDropdownProps) => {
  const handleToggle = (value: string) => {
    if (singleSelect) {
      onSelectionChange(selectedValues.includes(value) ? [] : [value]);
    } else {
      if (selectedValues.includes(value)) {
        onSelectionChange(selectedValues.filter((v) => v !== value));
      } else {
        onSelectionChange([...selectedValues, value]);
      }
    }
  };

  const hasSelection = selectedValues.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-11 gap-2",
            hasSelection && "border-primary/50 bg-primary/5",
            className
          )}
        >
          <Filter className="h-4 w-4" />
          {label}
          {hasSelection && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {selectedValues.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {hasSelection && (
          <>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground"
              onClick={() => onSelectionChange([])}
            >
              Καθαρισμός
            </Button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ActiveFiltersProps {
  filters: { key: string; label: string; value: string; displayValue: string }[];
  onRemove: (key: string, value: string) => void;
  onClearAll: () => void;
  className?: string;
}

const ActiveFilters = ({ filters, onRemove, onClearAll, className }: ActiveFiltersProps) => {
  if (filters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map((filter, index) => (
        <Badge
          key={`${filter.key}-${filter.value}-${index}`}
          variant="secondary"
          className="gap-1.5 pr-1.5 text-sm"
        >
          <span className="text-muted-foreground">{filter.label}:</span>
          {filter.displayValue}
          <button
            onClick={() => onRemove(filter.key, filter.value)}
            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 text-xs text-muted-foreground"
        >
          Καθαρισμός όλων
        </Button>
      )}
    </div>
  );
};

export { SearchFilter, FilterDropdown, ActiveFilters };
