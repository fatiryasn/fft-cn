"use client";

import { useEffect, useState } from "react";
import {
  getUserResourceCounts,
  type ResourceCounts,
} from "@/services/profile.service";

export function useResourceCounts() {
  const [counts, setCounts] = useState<ResourceCounts | null>(null);

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
