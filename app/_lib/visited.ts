"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "visitedStations";
const EMPTY_SET: ReadonlySet<string> = new Set();

function load(): ReadonlySet<string> {
  if (typeof window === "undefined") return EMPTY_SET;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const codes = raw ? JSON.parse(raw) : [];
    return Array.isArray(codes) ? new Set(codes) : EMPTY_SET;
  } catch {
    return EMPTY_SET;
  }
}

let visited: ReadonlySet<string> = load();
let listeners: Array<() => void> = [];

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited]));
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
  return visited;
}

function getServerSnapshot() {
  return EMPTY_SET;
}

export function toggleVisited(stationCode: string) {
  const next = new Set(visited);
  if (next.has(stationCode)) next.delete(stationCode);
  else next.add(stationCode);
  visited = next;
  persist();
  notify();
}

export function useVisitedStations(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
