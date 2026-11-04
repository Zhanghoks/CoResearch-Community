"use client";

import { useSyncExternalStore } from "react";

/** 减少动态 / 矮屏偏好（SSR 水合为 false:false，客户端订阅变化）。 */
function subscribePreferences(onChange: () => void) {
  const queries = [window.matchMedia("(prefers-reduced-motion: reduce)"), window.matchMedia("(max-height: 560px)")];
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
}
function preferences() {
  return `${window.matchMedia("(prefers-reduced-motion: reduce)").matches}:${window.matchMedia("(max-height: 560px)").matches}`;
}
const serverPreferences = () => "false:false";

export function useViewPreferences(): [reduce: boolean, short: boolean] {
  const preference = useSyncExternalStore(subscribePreferences, preferences, serverPreferences);
  return preference.split(":").map((value) => value === "true") as [boolean, boolean];
}
