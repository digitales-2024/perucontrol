"use client";

import React, { createContext, useContext } from "react";
import { components } from "@/types/api";

interface QuotationContextProps {
  quotations: Array<components["schemas"]["QuotationGetDTO"]>;
  terms: Array<components["schemas"]["TermsAndConditions"]>;
  clients: Array<components["schemas"]["ClientGetDTO"]>;
  services: Array<components["schemas"]["ServiceGetDTO"]>;
}

// Crear el contexto con un valor inicial opcional
const QuotationContext = createContext<QuotationContextProps | null>(null);

export const useQuotationContext = () =>
{
    const context = useContext(QuotationContext);
    if (!context)
    {
        throw new Error("useQuotationContext must be used within a QuotationProvider");
    }
    return context;
};

export const QuotationProvider: React.FC<{ children: React.ReactNode; value: QuotationContextProps }> = ({ children, value }) => (
    <QuotationContext.Provider value={value}>
        {children}
    </QuotationContext.Provider>
);
