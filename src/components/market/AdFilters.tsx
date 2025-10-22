
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { carData, makes as allMakes } from "@/lib/car-data";
import { Label } from "../ui/label";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
        <div className="lg:col-span-1 xl:col-span-2">
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
         <div className="grid grid-cols-2 gap-2">
            <div>
                <Label className="text-sm font-medium" htmlFor="min-year">Min Year</Label>
                <Input id="min-year" placeholder="e.g., 2018" type="number" />
            </div>
            <div>
                <Label className="text-sm font-medium" htmlFor="max-year">Max Year</Label>
                <Input id="max-year" placeholder="e.g., 2022" type="number" />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div>
                <Label className="text-sm font-medium" htmlFor="min-price">Min Price</Label>
                <Input id="min-price" placeholder="₹1 Lakh" />
            </div>
            <div>
                <Label className="text-sm font-medium" htmlFor="max-price">Max Price</Label>
                <Input id="max-price" placeholder="₹20 Lakh" />
            </div>
        </div>
         <div>
          <Label className="text-sm font-medium" htmlFor="fuel-type">Fuel Type</Label>
          <Select>
            <SelectTrigger id="fuel-type">
              <SelectValue placeholder="Any Fuel Type" />
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
              <SelectValue placeholder="Any Transmission" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="any">Any Transmission</SelectItem>
                <SelectItem value="Automatic">Automatic</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-end">
            <Button className="w-full"><Search className="mr-2 h-4 w-4" /> Apply</Button>
            <Button variant="ghost" size="icon" className="shrink-0"><X className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}
