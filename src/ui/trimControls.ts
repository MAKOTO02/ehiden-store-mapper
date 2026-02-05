import { el } from "./dom";


export type TrimApplyArgs1Based = {
  rowStart: number; rowEnd: number;
  colStart: number; colEnd: number;
  rowSpec: string;  colSpec: string;
};

export type TrimControlsOptions = {
  onApply: (args: TrimApplyArgs1Based) => void;
  onReset: () => void;
};


export function createTrimControls(opts: TrimControlsOptions) {
  const wrap = el("section", {
    style: [
      "margin:12px 0",
      "padding:10px",
      "border:1px solid #eee",
      "border-radius:8px",
      "display:flex",
      "gap:12px",
      "flex-wrap:wrap",
      "align-items:flex-end",
    ].join(";"),
  });

  const rs = numInput("行 開始", 1);
  const re = numInput("行 終了", 1);
  const cs = numInput("列 開始", 1);
  const ce = numInput("列 終了", 1);

  const applyBtn = el("button", { type: "button" }, "この範囲だけ残す") as HTMLButtonElement;
  const resetBtn = el("button", { type: "button" }, "元に戻す") as HTMLButtonElement;

  const hint = el("div", { style: "color:#666; font-size:12px; max-width:520px;" },
    "※ 行・列は 1 から数えます。先頭行をヘッダとして使うかは後で選べます。"
  );
  const rowSpecInput = el("input", { placeholder: "例: 1,3,5-7" }) as HTMLInputElement;
  const colSpecInput = el("input", { placeholder: "例: 1,3,5-7" }) as HTMLInputElement;
  const rowSpec = el(
  "label",
  { style: "display:flex; flex-direction:column; gap:4px; font-size:12px;" },
  el("span", { style: "color:#333;" }, "行（例: 1,3,5-7）"),
  rowSpecInput
);

const colSpec = el(
  "label",
  { style: "display:flex; flex-direction:column; gap:4px; font-size:12px;" },
  el("span", { style: "color:#333;" }, "列（例: 1,3,5-7）"),
  colSpecInput
);
rowSpecInput.style.cssText = "width:240px; padding:6px;";
colSpecInput.style.cssText = "width:240px; padding:6px;";




  applyBtn.onclick = () => {
  opts.onApply({
    rowStart: toInt(rs.input.value),
    rowEnd:   toInt(re.input.value),
    colStart: toInt(cs.input.value),
    colEnd:   toInt(ce.input.value),
    rowSpec:  rowSpecInput.value,   // ← 追加
    colSpec:  colSpecInput.value,   // ← 追加
  });
};

  resetBtn.onclick = () => opts.onReset();

  wrap.append(
    el("div", {}, rs.root),
    el("div", {}, re.root),
    el("div", {}, cs.root),
    el("div", {}, ce.root),
    el("div", {}, rowSpec),   // ← 追加
    el("div", {}, colSpec),   // ← 追加
    el("div", { style: "display:flex; gap:8px;" }, applyBtn, resetBtn),
    hint
  );

  function setEnabled(enabled: boolean) {
    for (const x of [rs.input, re.input, cs.input, ce.input, applyBtn, resetBtn]) x.disabled = !enabled;
  }

  function setBounds(rowCount: number, colCount: number) {
    // UIは1-based
    rs.input.min = "1"; rs.input.max = String(Math.max(1, rowCount));
    re.input.min = "1"; re.input.max = String(Math.max(1, rowCount));
    cs.input.min = "1"; cs.input.max = String(Math.max(1, colCount));
    ce.input.min = "1"; ce.input.max = String(Math.max(1, colCount));
  }

  function setDefaults(rowCount: number, colCount: number) {
    rs.input.value = "1";
    re.input.value = String(Math.max(1, Math.min(rowCount, 50))); // 最初は50行くらい
    cs.input.value = "1";
    ce.input.value = String(Math.max(1, colCount));
  }

  // 外部から制御するAPI
  return {
    root: wrap,
    setEnabled,
    setBounds,
    setDefaults,
  };
}

function numInput(label: string, value: number) {
  const input = el("input", {
    type: "number",
    value: String(value),
    style: "width:120px; padding:6px;",
  }) as HTMLInputElement;

  const root = el("label", { style: "display:flex; flex-direction:column; gap:4px; font-size:12px;" },
    el("span", { style: "color:#333;" }, label),
    input
  );

  return { root, input };
}

function toInt(s: string) {
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : 1;
}
