import { useMemo } from "react";

function readUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useAdminUser() {
  return useMemo(() => readUser(), []);
}
