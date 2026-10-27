"use client";
import { useSyncExternalStore } from "react";
const subscribe = () => () => {};
// Hydration-safe browser availability without an extra effect-driven state update.
export function useMounted() { return useSyncExternalStore(subscribe, () => true, () => false); }
