import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  isLoading: boolean;
  loaderText: string;
  isSubtleLoading: boolean;
  subtleLoaderText: string;
  showLoader: (text?: string) => void;
  hideLoader: () => void;
  showSubtleLoader: (text?: string) => void;
  hideSubtleLoader: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('Establishing Secure Uplink...');
  
  const [isSubtleLoading, setIsSubtleLoading] = useState(false);
  const [subtleLoaderText, setSubtleLoaderText] = useState('Syncing telemetry...');

  const showLoader = (text?: string) => {
    if (text) setLoaderText(text);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
    setLoaderText('Processing...');
  };

  const showSubtleLoader = (text?: string) => {
    if (text) setSubtleLoaderText(text);
    setIsSubtleLoading(true);
  };

  const hideSubtleLoader = () => {
    setIsSubtleLoading(false);
    setSubtleLoaderText('Syncing...');
  };

  return (
    <UIContext.Provider value={{
      isLoading, loaderText, isSubtleLoading, subtleLoaderText,
      showLoader, hideLoader, showSubtleLoader, hideSubtleLoader
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
