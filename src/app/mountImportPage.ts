import { el } from "../ui/dom";
import { renderTable } from "../ui/tableView";
import { createTrimControls } from "../ui/trimControls";

import { readTextFile } from "../core/fileRead";
import { parseDelimitedSimple } from "../core/parseDelimited";

import { parseIndexSpec1Based } from "../core/edit/indexSpec";
import { buildSelectionAND } from "../core/edit/selection";
import { pickRowsCols } from "../core/edit/pick";
import { getColCount } from "../core/edit/trim";

import { loadStoreMap, upsertMany } from "../core/master/storeRepo";
import { createImportPanel } from "../ui/master/importPanel";

export function mountImportPage(root: HTMLElement): () => void {
  const info = el("div", { style: "margin:8px 0; color:#333;" }, "未読み込み");

  const fileInput = el("input", {
    type: "file",
    accept: ".csv,.tsv,text/csv,text/tab-separated-values",
  }) as HTMLInputElement;

  const tableWrap = el("div", {
    style: "margin-top:12px; max-height:45vh; overflow:auto; border:1px solid #eee;",
  });

  let originalRows: string[][] = [];
  let currentRows: string[][] = [];

  const trimControls = createTrimControls({
    onApply: (arg) => {
      if (originalRows.length === 0) return;

      const rowCount = originalRows.length;
      const colCount = getColCount(originalRows);

      const rowRange0 = { start0: arg.rowStart - 1, end0: arg.rowEnd - 1 };
      const colRange0 = { start0: arg.colStart - 1, end0: arg.colEnd - 1 };

      const rowList = arg.rowSpec
        ? parseIndexSpec1Based(arg.rowSpec, rowCount)
        : { indices0: [], warnings: [] };

      const colList = arg.colSpec
        ? parseIndexSpec1Based(arg.colSpec, colCount)
        : { indices0: [], warnings: [] };

      const rowsSel = buildSelectionAND({
        count: rowCount,
        range0: rowRange0,
        list0: rowList.indices0.length ? rowList.indices0 : undefined,
      });

      const colsSel = buildSelectionAND({
        count: colCount,
        range0: colRange0,
        list0: colList.indices0.length ? colList.indices0 : undefined,
      });

      currentRows = pickRowsCols(originalRows, rowsSel.indices0, colsSel.indices0);
      renderTable(tableWrap, currentRows, 200);
      importPanel.setRows(currentRows);

      info.textContent = `抽出: 行=${currentRows.length}`;
    },
    onReset: () => {
      currentRows = originalRows;
      renderTable(tableWrap, currentRows, 200);
    },
  });

  trimControls.setEnabled(false);

  const importPanel = createImportPanel({
    getExisting: () => loadStoreMap(),
    commitUpsert: (stores) => upsertMany(stores),
    onCommit: () => {
      // ← ここでは masterView を直接触らない！
      // データは repo に入った、それで十分
    },
  });

  root.append(
    el("h2", {}, "CSV取り込み"),
    el("label", {}, "入力ファイル: ", fileInput),
    trimControls.root,
    info,
    tableWrap,
    importPanel.root
  );

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const text = await readTextFile(file);
    const parsed = parseDelimitedSimple(text);

    originalRows = parsed.rows;
    currentRows = originalRows;
    importPanel.setRows(currentRows);

    const colCount = getColCount(originalRows);
    trimControls.setBounds(originalRows.length, colCount);
    trimControls.setDefaults(originalRows.length, colCount);
    trimControls.setEnabled(true);

    renderTable(tableWrap, currentRows, 200);
  });

  return () => {
    // 今は何もしなくてOK
  };
}
