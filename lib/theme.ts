"use client";

import { useSyncExternalStore } from "react";

const THEME_KEY = "choerblidle-theme";
const THEME_EVENT = "choerblidle-theme";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function dunkelAktiv() {
  return document.documentElement.classList.contains("dark");
}

export function useDunkel() {
  return useSyncExternalStore(subscribe, dunkelAktiv, () => false);
}

export function setDunkel(an: boolean) {
  document.documentElement.classList.toggle("dark", an);
  localStorage.setItem(THEME_KEY, an ? "dark" : "light");
  window.dispatchEvent(new Event(THEME_EVENT));
}
