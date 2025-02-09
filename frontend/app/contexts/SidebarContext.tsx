'use client'
import React, { createContext, useState, ReactNode } from 'react';

interface SidebarContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextProps>({
  isOpen: false,
  setIsOpen: () => {},
});

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};
