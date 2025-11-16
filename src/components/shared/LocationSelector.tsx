
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { states, citiesByState } from '@/lib/location-data';
import { useLocation } from '@/hooks/use-location';
import { MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationSelector({ open, onOpenChange }: LocationSelectorProps) {
  const { location, setLocation, isLocating, locateUser } = useLocation();
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState(location.state || '');
  const [selectedCity, setSelectedCity] = useState(location.city || '');
  const [availableCities, setAvailableCities] = useState<string[]>(
    location.state ? citiesByState[location.state] || [] : []
  );

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCity('');
    setAvailableCities(citiesByState[state] || []);
  };

  const handleApply = () => {
    if (selectedState && selectedCity) {
      setLocation(selectedState, selectedCity);
      onOpenChange(false);
    } else {
        toast({
            variant: 'destructive',
            title: 'Incomplete Selection',
            description: 'Please select both a state and a city.',
        })
    }
  };

  const handleDetectLocation = async () => {
      const result = await locateUser();
      if(result) {
        setSelectedState(result.state);
        setSelectedCity(result.city);
        setAvailableCities(citiesByState[result.state] || []);
      }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Location</DialogTitle>
          <DialogDescription>
            Choose your city to see cars available in your area.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Button variant="outline" className="w-full" onClick={handleDetectLocation} disabled={isLocating}>
            <MapPin className="mr-2 h-4 w-4" />
            {isLocating ? 'Detecting...' : 'Detect My Location'}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleApply}>
            Apply Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
