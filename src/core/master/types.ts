export type Store = {
  storeCode: string;       // 主キー（必須）
  storeName?: string;
  zip?: string;
  address?: string;        // まずは1本でOK（佐川が分割してくれる想定）
  tel?: string;

  updatedAt: number;       // Unix ms（更新表示に便利）
};

export type StoreMap = Record<string, Store>;
