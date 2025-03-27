import * as React from "react";
import { useState, useRef, useEffect } from 'react';
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface Option {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: Option[];
  selected?: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
  value?: Option[];
  disabled?: boolean;
  className?: string;
  maxCount?: number;
  badgeClassName?: string;
  'aria-label'?: string;
  'aria-required'?: string;
}

export function MultiSelect({
  options,
  onChange,
  placeholder = "Select...",
  value = [],
  disabled = false,
  className,
  maxCount,
  badgeClassName,
  'aria-label': ariaLabel,
  'aria-required': ariaRequired,
  ...props
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const commandRef = useRef<HTMLDivElement>(null);
  const selectedValues = value.map(v => v.value);

  // Filter options by search query
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !option.disabled
  );

  // Helper function to remove an item from selection
  const deselectItem = (item: Option) => {
    const newValue = value.filter(i => i.value !== item.value);
    onChange(newValue);
  };

  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    // Close popover with Escape
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }

    // Open popover with arrow down when closed
    if (e.key === 'ArrowDown' && !open) {
      setOpen(true);
      e.preventDefault();
      return;
    }

    // Handle backspace to remove the last selected item
    if (e.key === 'Backspace' && searchQuery === '' && value.length > 0) {
      const newValue = [...value];
      newValue.pop();
      onChange(newValue);
    }
  };

  // Auto-scroll to keep focused item visible
  useEffect(() => {
    if (open && commandRef.current) {
      const selectedItem = commandRef.current.querySelector('[data-selected="true"]');
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [open, selectedValues]);

  // Reset search when closing popover
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel || "Multi-select dropdown"}
          aria-required={ariaRequired}
          aria-haspopup="listbox"
          aria-controls={open ? "multi-select-options" : undefined}
          className={cn(
            "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
        >
          <div className="flex flex-wrap gap-1">
            {value.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {value.map((item) => (
              <Badge
                key={item.value}
                variant="secondary"
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5",
                  badgeClassName
                )}
              >
                {item.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    deselectItem(item);
                  }}
                  aria-label={`Remove ${item.label}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-full min-w-[var(--radix-popover-trigger-width)]"
        align="start"
      >
        <Command ref={commandRef} className="max-h-96">
          <CommandInput 
            placeholder="Search options..." 
            className="h-9"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup id="multi-select-options" role="listbox" className="max-h-64 overflow-auto">
            {filteredOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  role="option"
                  aria-selected={isSelected}
                  data-selected={isSelected}
                  onSelect={() => {
                    const newValue = isSelected
                      ? value.filter(v => v.value !== option.value)
                      : [...value, option];
                    onChange(newValue);
                    // Don't close popover on selection to allow multiple selections
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className={cn(
                      "border border-primary rounded-sm w-4 h-4 flex items-center justify-center",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
