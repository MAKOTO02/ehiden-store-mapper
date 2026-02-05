import type { Store, StoreMap } from "./types";

export type ColumnMap = {
  storeCodeCol: number;          // 必須
  nameCols: number[]; 
  zipCol?: number;
  addressCol?: number;
  telCol?: number;
};

export type ImportOptions = {
  hasHeader: boolean;            // 先頭行はヘッダ扱い
  onConflict: "skip" | "overwrite";
};

export type ImportPlan = {
  toUpsert: Store[];             // upsert対象（overwrite含む）
  skippedNoCode: number;
  skippedExisting: number;       // onConflict=skip の場合
  willOverwrite: number;         // onConflict=overwrite の場合
};

export function buildImportPlan(
  rows: string[][],
  col: ColumnMap,
  existing: StoreMap,
  opts: ImportOptions
): ImportPlan {
  const start = opts.hasHeader ? 1 : 0;

  let skippedNoCode = 0;
  let skippedExisting = 0;
  let willOverwrite = 0;

  const toUpsert: Store[] = [];

  for (let r = start; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const code = getCell(row, col.storeCodeCol).trim();
    if (!code) {
      skippedNoCode++;
      continue;
    }

    const now = Date.now();

    // ★ 追加：名称1〜3を結合して storeName にする
    const storeName = joinNameCols(row, col.nameCols);

    const next: Store = {
      storeCode: code,
      storeName: storeName, // ← ここ
      zip:       col.zipCol != null ? nz(getCell(row, col.zipCol)) : undefined,
      address:   col.addressCol != null ? nz(getCell(row, col.addressCol)) : undefined,
      tel:       col.telCol != null ? nz(getCell(row, col.telCol)) : undefined,
      updatedAt: now,
    };

    const exists = !!existing[code];
    if (exists) {
      if (opts.onConflict === "skip") {
        skippedExisting++;
        continue;
      } else {
        willOverwrite++;
      }
    }

    toUpsert.push(next);
  }

  return { toUpsert, skippedNoCode, skippedExisting, willOverwrite };
}

function joinNameCols(row: string[], nameCols: number[]): string | undefined {
  if (!nameCols || nameCols.length === 0) return undefined;

  const parts = nameCols
    .map((i) => nz(getCell(row, i)))
    .filter((v): v is string => v != null);

  if (parts.length === 0) return undefined;

  // 半角スペース結合（必要なら "　" に変更）
  return parts.join(" ");
}


function getCell(row: string[], idx: number): string {
  return row[idx] ?? "";
}

function nz(s: string): string | undefined {
  const t = (s ?? "").trim();
  return t.length ? t : undefined;
}