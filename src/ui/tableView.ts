import { el } from "./dom";

function thStyle() {
  return [
    "border:1px solid #ccc",
    "padding:6px",
    "background:#f5f5f5",
    "position:sticky",
    "top:0",
    "z-index:1",
    "text-align:left",
    "white-space:nowrap",
  ].join(";");
}

function tdStyle() {
  return [
    "border:1px solid #ddd",
    "padding:6px",
    "vertical-align:top",
    "white-space:nowrap",
    "max-width:420px",
    "overflow:hidden",
    "text-overflow:ellipsis",
  ].join(";");
}

export function renderTable(container: HTMLElement, rows: string[][], maxRows = 200) {
  container.innerHTML = "";

  if (rows.length === 0) {
    container.append(el("p", {}, "（データが空です）"));
    return;
  }

  const colCount = Math.max(...rows.map((r) => r.length));
  const showRows = rows.slice(0, maxRows);

  const table = el("table", { style: "border-collapse:collapse; width:100%; font-size:13px;" });
  const thead = el("thead");
  const tbody = el("tbody");

  const header = showRows[0] ?? [];
  const trh = el("tr");
  trh.append(el("th", { style: thStyle() }, "#"));
  for (let c = 0; c < colCount; c++) {
    trh.append(el("th", { style: thStyle() }, header[c] ?? ""));
  }
  thead.append(trh);

  for (let r = 1; r < showRows.length; r++) {
    const row = showRows[r];
    const tr = el("tr");
    tr.append(el("td", { style: tdStyle() }, String(r)));
    for (let c = 0; c < colCount; c++) {
      tr.append(el("td", { style: tdStyle() }, row[c] ?? ""));
    }
    tbody.append(tr);
  }

  table.append(thead, tbody);
  container.append(table);

  if (rows.length > maxRows) {
    container.append(
      el(
        "p",
        { style: "margin-top:8px; color:#555;" },
        `※ 表示は先頭 ${maxRows} 行まで（全 ${rows.length} 行）`
      )
    );
  }
}
