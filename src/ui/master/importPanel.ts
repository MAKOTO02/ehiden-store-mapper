import { el } from "../dom";
import type { StoreMap } from "../../core/master/types";
import type { ColumnMap } from "../../core/master/import";
import { buildImportPlan } from "../../core/master/import";

export type ImportPanelOptions = {
  getExisting: () => StoreMap;
  onCommit: (toUpsertCount: number) => void;
  commitUpsert: (stores: any[]) => void;
};

export function createImportPanel(opts: ImportPanelOptions) {
  const root = el("section", { style: boxStyle() });
  let rows: string[][] = [];
  function setRows(newRows: string[][]) {
    rows = newRows;

    // rows が来た時点で列プルダウンを初期化
    if (rows.length === 0) {
        importBtn.disabled = true;
        preview.textContent = "";
        return;
    }

    cols.refreshOptions(rows);
    importBtn.disabled = true;
    preview.textContent = "列を選択して「取り込みプレビュー」を押してください。";
  }

  const hasHeader = checkbox("先頭行はヘッダ", true);
  const conflict = select(["skip", "overwrite"], ["既存はスキップ", "既存を上書き"], "skip");

  const mappingWrap = el("div", { style: "display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;" });
  const preview = el("div", { style: "margin-top:8px; font-size:12px; color:#333; white-space:pre-wrap;" }, "");
  const applyBtn = el("button", { type: "button" }, "この設定で取り込みプレビュー") as HTMLButtonElement;
  const importBtn = el("button", { type: "button" }, "取り込み実行") as HTMLButtonElement;
  importBtn.disabled = true;

  // 列選択UI（rowsが入ってから options を作る）
  const cols = createColumnPickers();

  mappingWrap.append(
    cols.storeCode.root, 
    cols.name1.root,
    cols.name2.root,
    cols.name3.root,
    cols.zip.root, 
    cols.address.root, 
    cols.tel.root
);

  let lastPlan: ReturnType<typeof buildImportPlan> | null = null;

  applyBtn.onclick = () => {
    if (!rows.length) { 
        preview.textContent = "データがありません。"; 
        importBtn.disabled = true; 
        return; }

    const header = rows[0] ?? [];
    const colCount = header.length || Math.max(...rows.map(r => r.length), 0);
    if (colCount === 0) { preview.textContent = "列がありません。"; importBtn.disabled = true; return; }

    const map: ColumnMap | null = cols.getMap();
    if (!map) { preview.textContent = "店舗コード列は必須です。"; importBtn.disabled = true; return; }

    const existing = opts.getExisting();
    lastPlan = buildImportPlan(rows, map, existing, {
      hasHeader: hasHeader.input.checked,
      onConflict: conflict.input.value as "skip" | "overwrite",
    });

    const addOrUpdate = lastPlan.toUpsert.length;
    preview.textContent =
      `プレビュー:\n` +
      `  追加/更新予定: ${addOrUpdate}\n` +
      `  店舗コードなしでスキップ: ${lastPlan.skippedNoCode}\n` +
      `  既存スキップ: ${lastPlan.skippedExisting}\n` +
      `  上書き予定: ${lastPlan.willOverwrite}\n`;

    importBtn.disabled = addOrUpdate === 0;
  };

  importBtn.onclick = () => {
    if (!lastPlan) return;
    opts.commitUpsert(lastPlan.toUpsert);
    opts.onCommit(lastPlan.toUpsert.length);
    preview.textContent += `\n\n取り込み完了: ${lastPlan.toUpsert.length} 件`;
    importBtn.disabled = true;
  };

  root.append(
    el("h2", { style: "margin:0 0 8px 0; font-size:16px;" }, "CSVから店舗マスタへ取り込み"),
    el("div", { style: "display:flex; gap:12px; flex-wrap:wrap; align-items:center;" },
      hasHeader.root,
      labeled("競合時の挙動", conflict.root)
    ),
    el("div", { style: "margin-top:8px; font-size:12px; color:#666;" },
      "列を選んでプレビュー → OKなら取り込み実行。住所は「住所」1列にまとめてOKです。"
    ),
    el("div", { style: "margin-top:8px;" }, mappingWrap),
    el("div", { style: "display:flex; gap:8px; margin-top:10px;" }, applyBtn, importBtn),
    preview
  );

  return { root, setRows };

  // ---- helpers ----
  function createColumnPickers() {
    const storeCode = colSelect("店舗コード（必須）");
    const name1 = colSelect("名称1");
    const name2 = colSelect("名称2");
    const name3 = colSelect("名称3");

    const zip = colSelect("郵便番号");
    const address = colSelect("住所（1列でOK）");
    const tel = colSelect("電話番号");

    function refreshOptions(rows: string[][]) {
      const header = rows[0] ?? [];
      const colCount = header.length || Math.max(...rows.map(r => r.length), 0);
      const labels = Array.from({ length: colCount }, (_, i) => {
        const h = header[i]?.trim();
        return h ? `${i + 1}: ${h}` : `${i + 1}`;
      });

      storeCode.setOptions(labels);
      name1.setOptions(["(未設定)", ...labels], true);
      name2.setOptions(["(未設定)", ...labels], true);
      name3.setOptions(["(未設定)", ...labels], true);
      zip.setOptions(["(未設定)", ...labels], true);
      address.setOptions(["(未設定)", ...labels], true);
      tel.setOptions(["(未設定)", ...labels], true);
    }

    function getMap(): ColumnMap | null {
      const code = storeCode.getIndex0();
      if (code == null) return null;

      const nameCols = [
        name1.getIndex0(true),
        name2.getIndex0(true),
        name3.getIndex0(true),
      ].filter((v): v is number => v != null);

      return {
        storeCodeCol: code,
        nameCols,
        zipCol: zip.getIndex0(true),
        addressCol: address.getIndex0(true),
        telCol: tel.getIndex0(true),
      };
    }

    return {
      storeCode,
      name1,
      name2,
      name3,
      zip,
      address,
      tel,
      refreshOptions,
      getMap,
    };
  }
}

function colSelect(label: string) {
  const sel = el("select", { style: "width:220px; padding:6px;" }) as HTMLSelectElement;
  const root = el("label", { style: "display:flex; flex-direction:column; gap:4px; font-size:12px;" },
    el("span", { style: "color:#333;" }, label),
    sel
  );

  function setOptions(labels: string[], hasNone = false) {
    sel.innerHTML = "";
    for (let i = 0; i < labels.length; i++) {
      sel.append(el("option", { value: String(i) }, labels[i]));
    }
    if (hasNone) sel.value = "0"; // "(未設定)"
    else sel.value = "0";
  }

  function getIndex0(hasNone = false): number | undefined {
    const v = Number(sel.value);
    if (!Number.isFinite(v)) return undefined;
    if (hasNone && v === 0) return undefined;
    return hasNone ? (v - 1) : v;
  }

  return { root, input: sel, setOptions, getIndex0 };
}

function checkbox(label: string, checked: boolean) {
  const input = el("input", { type: "checkbox" }) as HTMLInputElement;
  input.checked = checked;
  const root = el("label", { style: "display:flex; gap:6px; align-items:center; font-size:12px;" }, input, label);
  return { root, input };
}

function select(values: string[], labels: string[], initial: string) {
  const input = el("select", { style: "padding:6px;" }) as HTMLSelectElement;
  for (let i = 0; i < values.length; i++) {
    input.append(el("option", { value: values[i] }, labels[i]));
  }
  input.value = initial;
  return { root: input, input };
}

function labeled(label: string, node: Node) {
  return el("label", { style: "display:flex; flex-direction:column; gap:4px; font-size:12px;" },
    el("span", { style: "color:#333;" }, label),
    node
  );
}

function boxStyle() {
  return [
    "border:1px solid #eee",
    "border-radius:8px",
    "padding:10px",
    "margin:12px 0",
  ].join(";");
}
