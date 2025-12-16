"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface IQueryProviderProps {
    children: React.ReactNode;
}

export const QueryProvider = ({ children }: IQueryProviderProps) => {
    const [queryClient] = useState(() => new QueryClient());

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
