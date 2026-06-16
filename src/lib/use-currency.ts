"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CurrencyCode } from "./money";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "./currency";
import { setCurrencyAction } from "./currency-actions";

function readCurrencyCookie(): CurrencyCode {
  if (typeof document === "undefined") return DEFAULT_CURRENCY;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CURRENCY_COOKIE}=([^;]*)`));
  const v = match ? decodeURIComponent(match[1]) : "";
  return (SUPPORTED_CURRENCIES as string[]).includes(v) ? (v as CurrencyCode) : DEFAULT_CURRENCY;
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>(readCurrencyCookie);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function setCurrency(next: CurrencyCode) {
    setCurrencyState(next);
    startTransition(async () => {
      await setCurrencyAction(next);
      router.refresh();
    });
  }

  return { currency, setCurrency, isPending };
}
