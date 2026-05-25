import React from "react";
import { AuthProvider } from "./AuthProvider";
import { DataProvider } from "./DataProvider";
import { CartProvider } from "./CartProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>
        <CartProvider>{children}</CartProvider>
      </DataProvider>
    </AuthProvider>
  );
}
