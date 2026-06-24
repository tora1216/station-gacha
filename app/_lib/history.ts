"use client";

import { useSyncExternalStore } from "react";

export type HistoryEntry = {
  id: string;
  lineCode: string;
  stationCode: string;
  createdAt: number;
};

const STORAGE_KEY = "gachaHistory";
const MAX_ENTRIES = 200;
const EMPTY_LIST: HistoryEntry[] = [];

function load(): HistoryEntry[] {
  if (typeof window === "undefined") return EMPTY_LIST;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : EMPTY_LIST;
  } catch {
    return EMPTY_LIST;
  }
}

let history: HistoryEntry[] = load();
let listeners: Array<() => void> = [];

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
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
  return history;
}

function getServerSnapshot() {
  return EMPTY_LIST;
}

export function addHistoryEntry(lineCode: string, stationCode: string) {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    lineCode,
    stationCode,
    createdAt: Date.now(),
  };
  history = [entry, ...history].slice(0, MAX_ENTRIES);
  persist();
  notify();
}

export function useHistory(): HistoryEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
