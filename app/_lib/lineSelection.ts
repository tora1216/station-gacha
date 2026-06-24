"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "excludedLines";
const EMPTY_SET: ReadonlySet<string> = new Set();

function loadExcluded(): ReadonlySet<string> {
  if (typeof window === "undefined") return EMPTY_SET;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const codes = raw ? JSON.parse(raw) : [];
    return Array.isArray(codes) ? new Set(codes) : EMPTY_SET;
  } catch {
    return EMPTY_SET;
  }
}

let excluded: ReadonlySet<string> = loadExcluded();
let listeners: Array<() => void> = [];

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...excluded]));
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
  return excluded;
}

function getServerSnapshot() {
  return EMPTY_SET;
}

export function setLinesExcluded(codes: string[], isExcluded: boolean) {
  const next = new Set(excluded);
  for (const code of codes) {
    if (isExcluded) next.add(code);
    else next.delete(code);
  }
  excluded = next;
  persist();
  notify();
}

export function useExcludedLines(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
