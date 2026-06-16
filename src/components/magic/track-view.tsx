"use client";

import { useEffect } from "react";
import { useRecentlyViewed, type RecentItem } from "@/stores/recently-viewed";

export function TrackView({ item }: { item: RecentItem }) {
  const track = useRecentlyViewed((s) => s.track);
  useEffect(() => { track(item); }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
