import type { Store, StoreMap } from "./types";

const KEY = "ehiden-store-mapper:store-master:v1";

export function loadStoreMap(): StoreMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw) as StoreMap;
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

export function saveStoreMap(map: StoreMap): void {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function upsertStore(store: Store): void {
  const map = loadStoreMap();
  map[store.storeCode] = store;
  saveStoreMap(map);
}

export function deleteStore(storeCode: string): void {
  const map = loadStoreMap();
  delete map[storeCode];
  saveStoreMap(map);
}

export function listStores(): Store[] {
  const map = loadStoreMap();
  return Object.values(map).sort((a, b) => (a.storeCode > b.storeCode ? 1 : -1));
}

export function getStore(storeCode: string): Store | undefined {
  const map = loadStoreMap();
  return map[storeCode];
}

export function upsertMany(stores: Store[]) {
  const map = loadStoreMap();
  for (const s of stores) map[s.storeCode] = s;
  saveStoreMap(map);
}
