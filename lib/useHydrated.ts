"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Bernilai false saat render di server dan saat hidrasi pertama, lalu true
 * setelah komponen terpasang di browser. Dipakai untuk menahan UI yang
 * bergantung pada localStorage supaya tidak berbeda dengan hasil server.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
