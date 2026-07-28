import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { clearAuthToken, getAuthToken, setAuthToken, authApi } from '@/lib/api';

export interface VendorUser {
  id: string;
  email?: string;
  phoneNumber: string;
  role: 'ADMIN' | 'CUSTOMER' | 'RESTAURANT' | 'DELIVERY';
}

export interface RestaurantData {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phoneNumber: string;
  email?: string;
  ownerName?: string;
  addressText?: string;
  area?: string;
  city?: string;
  pincode?: string;
  rating: number;
  isOpening: boolean;
  isActive: boolean;
  isVerified?: boolean;
  latitude: number;
  longitude: number;
  cuisineType?: string;
  avgDeliveryTime: number;
  minOrder: number;
  deliveryCharge: number;
  deliveryRadius: number;
}

export interface StoreData {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  phoneNumber: string;
  email?: string;
  rating: number;
  isOpening: boolean;
  latitude: number;
  longitude: number;
}

interface VendorContextType {
  user: VendorUser | null;
  restaurant: RestaurantData | null;
  store: StoreData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginSession: (token: string, userData: VendorUser, restaurantData?: RestaurantData, storeData?: StoreData) => void;
  logout: () => void;
  setRestaurant: (restaurant: RestaurantData | null) => void;
  setStore: (store: StoreData | null) => void;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function VendorProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<VendorUser | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [store, setStore] = useState<StoreData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('dago_vendor_user');
    const savedRest = localStorage.getItem('dago_vendor_restaurant');
    const savedStore = localStorage.getItem('dago_vendor_store');
    const token = getAuthToken();

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        if (savedRest) setRestaurant(JSON.parse(savedRest));
        if (savedStore) setStore(JSON.parse(savedStore));
      } catch (e) {
        clearAuthToken();
      }
    }
    setIsLoading(false);
  }, []);

  const loginSession = useCallback(
    (token: string, userData: VendorUser, restaurantData?: RestaurantData, storeData?: StoreData) => {
      setAuthToken(token);
      setUser(userData);
      localStorage.setItem('dago_vendor_user', JSON.stringify(userData));

      if (restaurantData) {
        setRestaurant(restaurantData);
        localStorage.setItem('dago_vendor_restaurant', JSON.stringify(restaurantData));
      }
      if (storeData) {
        setStore(storeData);
        localStorage.setItem('dago_vendor_store', JSON.stringify(storeData));
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setRestaurant(null);
    setStore(null);
    localStorage.removeItem('dago_vendor_user');
    localStorage.removeItem('dago_vendor_restaurant');
    localStorage.removeItem('dago_vendor_store');
    window.location.href = '/login';
  }, []);

  return (
    <VendorContext.Provider
      value={{
        user,
        restaurant,
        store,
        isAuthenticated: !!user || !!getAuthToken(),
        isLoading,
        loginSession,
        logout,
        setRestaurant,
        setStore,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendor must be used within VendorProvider');
  }
  return context;
}
