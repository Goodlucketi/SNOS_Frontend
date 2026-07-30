import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;
}

export interface Package {
  id: string;
  goal: string;
  sub_question: string;
  explanation: string;
  examples: string[];
  color_theme: string;
  image_url: string;
  included_products: string[];
}

export interface ShippingOption {
  id: string;
  title: string;
  description: string;
  price: number;
  installation_fee: number;
  estimated_days: string;
}

interface CatalogContextType {
  products: Product[];
  packages: Package[];
  shippingOptions: ShippingOption[];
  isLoading: boolean;
  error: string | null;
}

const CatalogContext = createContext<CatalogContextType>({
  products: [],
  packages: [],
  shippingOptions: [],
  isLoading: true,
  error: null
});

export const useCatalog = () => useContext(CatalogContext);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, packRes, shipRes] = await Promise.all([
          supabase.from('products').select('*').eq("is_active", true),
          supabase.from('packages').select('*').eq("is_active", true),
          supabase.from('shipping_options').select('*')
        ]);

        if (prodRes.error) throw prodRes.error;
        if (packRes.error) throw packRes.error;
        if (shipRes.error) throw shipRes.error;

        setProducts(prodRes.data as Product[]);
        setPackages(packRes.data as Package[]);
        setShippingOptions(shipRes.data as ShippingOption[]);
      } catch (err: any) {
        console.error('Error fetching catalog data:', err);
        setError(err.message || 'Failed to load catalog');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <CatalogContext.Provider value={{ products, packages, shippingOptions, isLoading, error }}>
      {children}
    </CatalogContext.Provider>
  );
};
