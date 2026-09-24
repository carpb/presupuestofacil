import type { Quote, SavedConcept } from "@/types/quote";

const DRAFT_KEY = "presupuesto-facil:draft";
const HISTORY_KEY = "presupuesto-facil:history";
const CONCEPTS_KEY = "presupuesto-facil:concepts";
const HISTORY_LOGO_KEY = "presupuesto-facil:history-logo";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    const probe = "__pf_storage_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function loadDraft(): Quote | null {
  const storage = getStorage();
  return storage ? safeParse(storage.getItem(DRAFT_KEY), null as Quote | null) : null;
}

export function saveDraft(quote: Quote): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(DRAFT_KEY, JSON.stringify(quote));
    return true;
  } catch {
    return false;
  }
}

export function loadHistory(): Quote[] {
  const storage = getStorage();
  return storage ? safeParse(storage.getItem(HISTORY_KEY), [] as Quote[]) : [];
}

export function loadHistoryLogo(): string | undefined {
  const storage = getStorage();
  if (!storage) return undefined;
  try { return storage.getItem(HISTORY_LOGO_KEY) || undefined; } catch { return undefined; }
}

export function saveToHistory(quote: Quote): Quote[] {
  const storage = getStorage();
  if (storage && quote.logoDataUrl) {
    try { storage.setItem(HISTORY_LOGO_KEY, quote.logoDataUrl); } catch { /* draft still works */ }
  }
  const historyQuote = { ...quote };
  delete historyQuote.logoDataUrl;
  const existing = loadHistory().filter((q) => q.id !== quote.id);
  const next = [historyQuote, ...existing].slice(0, 30);
  try { storage?.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* local storage is optional */ }
  return next;
}

export function deleteHistory(id: string): Quote[] {
  const storage = getStorage();
  const next = loadHistory().filter((q) => q.id !== id);
  try { storage?.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}

export function loadConcepts(): SavedConcept[] {
  const storage = getStorage();
  return storage ? safeParse(storage.getItem(CONCEPTS_KEY), [] as SavedConcept[]) : [];
}

export function saveConcept(concept: SavedConcept): SavedConcept[] {
  const storage = getStorage();
  const existing = loadConcepts().filter(
    (c) => c.id !== concept.id && c.description.trim().toLowerCase() !== concept.description.trim().toLowerCase(),
  );
  const next = [concept, ...existing].slice(0, 50);
  try { storage?.setItem(CONCEPTS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}

export function deleteConcept(id: string): SavedConcept[] {
  const storage = getStorage();
  const next = loadConcepts().filter((c) => c.id !== id);
  try { storage?.setItem(CONCEPTS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}

export function clearAllLocalData() {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(DRAFT_KEY);
    storage.removeItem(HISTORY_KEY);
    storage.removeItem(CONCEPTS_KEY);
    storage.removeItem(HISTORY_LOGO_KEY);
  } catch { /* ignore */ }
}
