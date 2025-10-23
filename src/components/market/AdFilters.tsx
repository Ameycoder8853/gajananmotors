
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { carData, makes as allMakes } from "@/lib/car-data";
import { Label } from "../ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

export function AdFilters() {
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const handleMakeChange = (make: string) => {
    if (make === 'any') {
      setSelectedMake('');
      setModels([]);
    } else {
      setSelectedMake(make);
      setModels(carData[make] || []);
    }
  };

  // Sync collapsible state with screen size changes
  useState(() => {
    setIsOpen(!isMobile);
  });
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-card p-4 rounded-lg border shadow-sm"
    >
      <div className="flex items-center justify-between lg:hidden mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle filters</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
          <div className="col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-2">
            <Label className="text-sm font-medium" htmlFor="search">Search by keyword</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="search" placeholder="e.g., 'Hyundai Creta 2021'" className="pl-10" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium" htmlFor="make">Make</Label>
            <Select onValueChange={handleMakeChange}>
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
            <Select disabled={!selectedMake}>
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
                  <Input id="min-year" placeholder="Min" type="number" />
                  <Input id="max-year" placeholder="Max" type="number" />
              </div>
          </div>
           <div className="col-span-2 sm:col-span-1">
              <Label className="text-sm font-medium">Price</Label>
              <div className="grid grid-cols-2 gap-2">
                  <Input id="min-price" placeholder="Min" />
                  <Input id="max-price" placeholder="Max" />
              </div>
          </div>
          <div>
            <Label className="text-sm font-medium" htmlFor="fuel-type">Fuel Type</Label>
            <Select>
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
            <Select>
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
              <Button className="w-full"><Search className="mr-2 h-4 w-4" /> Apply Filters</Button>
              <Button variant="ghost" className="w-full">
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
