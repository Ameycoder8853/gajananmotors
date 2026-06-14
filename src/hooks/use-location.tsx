
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Location {
  state: string;
  city: string;
}

interface LocationContextType {
  location: Location;
  setLocation: (state: string, city: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location>({ state: '', city: '' });

  const setLocation = (state: string, city: string) => {
    setLocationState({ state, city });
  };
  
  return (
    <LocationContext.Provider value={{ location, setLocation }}>
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
