
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { carData, makes as allMakes } from "@/lib/car-data";
import { Label } from "../ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Filters } from "@/app/(public)/market/page";

type AdFiltersProps = {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

export function AdFilters({ filters, setFilters }: AdFiltersProps) {
  const [models, setModels] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name: keyof Filters, value: string) => {
    if (value === 'any') {
      value = '';
    }
    
    let newFilters: Partial<Filters> = { [name]: value };

    if (name === 'make') {
      const newMake = value;
      if (newMake) {
        setModels(carData[newMake] || []);
        newFilters.model = ''; // Reset model when make changes
      } else {
        setModels([]);
        newFilters.model = '';
      }
    }
    
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const handleReset = () => {
    setFilters({
      searchQuery: '',
      make: '',
      model: '',
      minYear: '',
      maxYear: '',
      minPrice: '',
      maxPrice: '',
      fuelType: '',
      transmission: '',
    });
    setModels([]);
  };

  // Sync collapsible state with screen size changes
  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);
  
  return (
    <div className="space-y-4">
      {/* Standalone Search Bar */}
      <div className="flex w-full max-w-xl mx-auto items-center space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            id="searchQuery"
            placeholder="Search by car name, e.g., 'Hyundai Creta'" 
            className="pl-10"
            value={filters.searchQuery}
            onChange={handleInputChange}
          />
        </div>
        {/* The button can be used to manually trigger search on mobile, or just for show. Live search is handled by onChange. */}
        <Button type="submit">
          <Search className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Search</span>
        </Button>
      </div>
      
      {/* Collapsible Additional Filters */}
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="bg-card p-4 rounded-lg border shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Additional Filters</h3>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle filters</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
            <div>
              <Label className="text-sm font-medium" htmlFor="make">Make</Label>
              <Select value={filters.make} onValueChange={(v) => handleSelectChange('make', v)}>
                <SelectTrigger id="make">
                  <SelectValue placeholder="Any Make" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Make</SelectItem>
                  {allMakes.map(make => <SelectItem key={make} value={make}>{make}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium" htmlFor="model">Model</Label>
              <Select value={filters.model} onValueChange={(v) => handleSelectChange('model', v)} disabled={!filters.make}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Any Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Model</SelectItem>
                  {models.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 sm:col-span-1">
                <Label className="text-sm font-medium">Year</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Input id="minYear" placeholder="Min" type="number" value={filters.minYear} onChange={handleInputChange} />
                    <Input id="maxYear" placeholder="Max" type="number" value={filters.maxYear} onChange={handleInputChange} />
                </div>
            </div>
             <div className="col-span-2 sm:col-span-1">
                <Label className="text-sm font-medium">Price</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Input id="minPrice" placeholder="Min" type="number" value={filters.minPrice} onChange={handleInputChange} />
                    <Input id="maxPrice" placeholder="Max" type="number" value={filters.maxPrice} onChange={handleInputChange} />
                </div>
            </div>
            <div>
              <Label className="text-sm font-medium" htmlFor="fuel-type">Fuel Type</Label>
              <Select value={filters.fuelType} onValueChange={(v) => handleSelectChange('fuelType', v)}>
                <SelectTrigger id="fuel-type">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="any">Any Fuel Type</SelectItem>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="CNG">CNG</SelectItem>
                    <SelectItem value="LPG">LPG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium" htmlFor="transmission">Transmission</Label>
              <Select value={filters.transmission} onValueChange={(v) => handleSelectChange('transmission', v)}>
                <SelectTrigger id="transmission">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="any">Any Transmission</SelectItem>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 md:col-span-3 lg:col-span-2 xl:col-span-2 flex gap-2 items-end">
                {/* The "Apply" button is now redundant with live filtering, but can be kept for clarity */}
                <Button className="w-full" onClick={() => { /* Can be used to apply all filters at once if live is disabled */ }}>
                    <Search className="mr-2 h-4 w-4" /> Apply Filters
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleReset}>
                  <X className="mr-2 h-4 w-4" />
                  Reset
                </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
