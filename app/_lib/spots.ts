"use client";

import { useSyncExternalStore } from "react";

export type Spot = {
  id: string;
  name: string;
  memo?: string;
  url?: string;
  createdAt: number;
};

type SpotsMap = Record<string, Spot[]>;

const STORAGE_KEY = "stationSpots";
const EMPTY_MAP: SpotsMap = {};
const EMPTY_LIST: Spot[] = [];

function load(): SpotsMap {
  if (typeof window === "undefined") return EMPTY_MAP;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed !== null ? parsed : EMPTY_MAP;
  } catch {
    return EMPTY_MAP;
  }
}

let spots: SpotsMap = load();
let listeners: Array<() => void> = [];

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(spots));
  } catch {
    // ignore write failures (e.g. private mode)
  }
}

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function getSnapshot() {
  return spots;
}

function getServerSnapshot() {
  return EMPTY_MAP;
}

export function addSpot(stationCode: string, name: string, memo?: string, url?: string) {
  const spot: Spot = { id: crypto.randomUUID(), name, memo, url, createdAt: Date.now() };
  spots = { ...spots, [stationCode]: [...(spots[stationCode] ?? []), spot] };
  persist();
  notify();
}

export function removeSpot(stationCode: string, id: string) {
  spots = { ...spots, [stationCode]: (spots[stationCode] ?? []).filter((s) => s.id !== id) };
  persist();
  notify();
}

export function useStationSpots(stationCode: string): Spot[] {
  const all = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return all[stationCode] ?? EMPTY_LIST;
}
