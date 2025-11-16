
'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useToast } from './use-toast';

interface Location {
  state: string;
  city: string;
}

interface LocationContextType {
  location: Location;
  setLocation: (state: string, city: string) => void;
  isLocating: boolean;
  locateUser: () => Promise<{ state: string, city: string } | null>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location>({ state: '', city: '' });
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  const setLocation = (state: string, city: string) => {
    setLocationState({ state, city });
  };
  
  const locateUser = useCallback(async (): Promise<{ state: string, city: string } | null> => {
      setIsLocating(true);
      try {
        // This is a mock implementation. A real implementation would use a Geocoding API.
        // For this demo, we'll just set a default location.
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        const mockLocation = { state: 'Maharashtra', city: 'Pune' };
        
        setLocationState(mockLocation);
        toast({
            title: 'Location Detected',
            description: `Location set to ${mockLocation.city}, ${mockLocation.state}.`,
        })
        return mockLocation;
      } catch (error) {
          toast({
              variant: 'destructive',
              title: 'Location Error',
              description: 'Could not detect your location. Please select it manually.',
          })
          return null;
      } finally {
        setIsLocating(false);
      }
  }, [toast]);

  return (
    <LocationContext.Provider value={{ location, setLocation, isLocating, locateUser }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
