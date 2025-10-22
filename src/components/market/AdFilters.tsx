"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { carData, makes as allMakes } from "@/lib/car-data";

export function AdFilters() {
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [models, setModels] = useState<string[]>([]);

  const handleMakeChange = (make: string) => {
    if (make === 'any') {
      setSelectedMake('');
      setModels([]);
    } else {
      setSelectedMake(make);
      setModels(carData[make] || []);
    }
  };
  
  return (
    <div className="bg-card p-4 rounded-lg border shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
        <div className="xl:col-span-2">
          <label className="text-sm font-medium" htmlFor="search">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="search" placeholder="e.g., 'Hyundai Creta 2021'" className="pl-10" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="make">Make</label>
          <Select onValueChange={handleMakeChange}>
            <SelectTrigger id="make">
              <SelectValue placeholder="Select Make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Make</SelectItem>
              {allMakes.map(make => <SelectItem key={make} value={make}>{make}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="model">Model</label>
          <Select disabled={!selectedMake}>
            <SelectTrigger id="model">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Model</SelectItem>
              {models.map(model => <SelectItem key={model} value={model}>{model}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="text-sm font-medium" htmlFor="min-price">Min Price</label>
                <Input id="min-price" placeholder="₹1 Lakh" />
            </div>
            <div>
                <label className="text-sm font-medium" htmlFor="max-price">Max Price</label>
                <Input id="max-price" placeholder="₹20 Lakh" />
            </div>
        </div>
        <div className="flex gap-2">
            <Button className="w-full"><Search className="mr-2 h-4 w-4" /> Apply</Button>
            <Button variant="ghost" size="icon" className="shrink-0"><X className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}
