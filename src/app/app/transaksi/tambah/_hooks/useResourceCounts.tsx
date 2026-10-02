"use client";

import { useEffect, useState } from "react";
import { getUserResourceCounts } from "@/services/profile.service";

export function useResourceCounts() {
  const [counts, setCounts] = useState<{
    accountCount: number;
    categoryCount: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUserResourceCounts().then((c) => {
      if (!cancelled) setCounts(c);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return counts;
}
