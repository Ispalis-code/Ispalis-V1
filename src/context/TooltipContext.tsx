'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TooltipContextType {
  tooltipsEnabled: boolean;
  toggleTooltips: () => void;
}

const TooltipContext = createContext<TooltipContextType>({
  tooltipsEnabled: true,
  toggleTooltips: () => {},
});

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tooltipsEnabled, setTooltipsEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ispalis_tooltips');
    if (saved !== null) setTooltipsEnabled(saved === 'true');
  }, []);

  const toggleTooltips = () => {
    setTooltipsEnabled(prev => {
      localStorage.setItem('ispalis_tooltips', String(!prev));
      return !prev;
    });
  };

  return (
    <TooltipContext.Provider value={{ tooltipsEnabled, toggleTooltips }}>
      {children}
    </TooltipContext.Provider>
  );
}

export const useTooltip = () => useContext(TooltipContext);
