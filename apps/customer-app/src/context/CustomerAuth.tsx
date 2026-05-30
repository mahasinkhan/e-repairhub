import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CustomerData {
  token: string;
  phone: string;
  name:  string;
}

interface CustomerAuthContextType {
  customer:   CustomerData | null;
  loading:    boolean;
  isLoggedIn: boolean;
  login:      (data: CustomerData) => void;
  logout:     () => void;
  updateName: (name: string, newToken?: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const CustomerAuthContext = createContext<CustomerAuthContextType>({
  customer:   null,
  loading:    true,
  isLoggedIn: false,
  login:      () => undefined,
  logout:     () => undefined,
  updateName: () => undefined,
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading,  setLoading]  = useState(true);

  // Initialise from localStorage synchronously before first render
  // Using useState initializer avoids the setState-in-effect lint warning
  const [initialised] = useState<CustomerData | null>(() => {
    try {
      const stored = localStorage.getItem("erepairhub.customer");
      if (stored) {
        const parsed = JSON.parse(stored) as CustomerData;
        if (parsed?.token && parsed?.phone) return parsed;
      }
    } catch { /* ignore */ }
    return null;
  });

  useEffect(() => {
    if (initialised) setCustomer(initialised);
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback((data: CustomerData) => {
    setCustomer(data);
    localStorage.setItem("erepairhub.customer", JSON.stringify(data));
  }, []);

  const logout = useCallback(() => {
    setCustomer(null);
    localStorage.removeItem("erepairhub.customer");
  }, []);

  const updateName = useCallback((name: string, newToken?: string) => {
    setCustomer(prev => {
      if (!prev) return prev;
      const updated: CustomerData = {
        ...prev,
        name,
        token: newToken ?? prev.token,
      };
      localStorage.setItem("erepairhub.customer", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <CustomerAuthContext.Provider value={{
      customer,
      loading,
      isLoggedIn: !!customer,
      login,
      logout,
      updateName,
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

// ── Hook — exported separately so react-refresh doesn't complain ──────────────
// eslint-disable-next-line react-refresh/only-export-components
export function useCustomerAuth(): CustomerAuthContextType {
  return useContext(CustomerAuthContext);
}