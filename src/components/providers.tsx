"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { SwRegister } from "@/components/sw-register";
import { PushSubscribe } from "@/components/push-subscribe";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
      }),
  );

  return (
    <SessionProvider basePath="/api/v1/auth">
      <QueryClientProvider client={queryClient}>
        {children}
        <SwRegister />
        <PushSubscribe />
      </QueryClientProvider>
    </SessionProvider>
  );
}
