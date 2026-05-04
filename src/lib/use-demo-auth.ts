import { useEffect, useState, useSyncExternalStore, useMemo } from "react";
import { ensureSeed, getSession, type DemoUser } from "./demo-store";

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("demo-store-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("demo-store-change", handler);
    window.removeEventListener("storage", handler);
  };
}

export function useDemoSession(): DemoUser | null {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    ensureSeed();
    setHydrated(true);
  }, []);
  const sessionStr = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(getSession()),
    () => "null",
  );
  const session = useMemo(() => {
    return sessionStr === "null" ? null : (JSON.parse(sessionStr) as DemoUser);
  }, [sessionStr]);

  if (!hydrated) return null;
  return session;
}

export function useDemoStore<T>(selector: () => T): T {
  const dataStr = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(selector()),
    () => JSON.stringify(selector()),
  );
  return useMemo(() => JSON.parse(dataStr), [dataStr]);
}
