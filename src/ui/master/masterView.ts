import { el } from "../dom";
import type { Store } from "../../core/master/types";

export type MasterViewOptions = {
  onSelect: (store: Store) => void;
  onCreateNew: () => void;
};

export function createMasterView(opts: MasterViewOptions) {
  const root = el("section", { style: boxStyle() });

  const q = el("input", { type: "text", placeholder: "検索: 店舗コード / 店舗名", style: "width:320px; padding:6px;" }) as HTMLInputElement;
  const newBtn = el("button", { type: "button" }, "新規作成") as HTMLButtonElement;

  const listWrap = el("div", { style: "margin-top:8px; max-height:260px; overflow:auto; border:1px solid #eee;" });

  newBtn.onclick = () => opts.onCreateNew();

  root.append(
    el("h2", { style: "margin:0 0 8px 0; font-size:16px;" }, "店舗マスタ一覧"),
    el("div", { style: "display:flex; gap:8px; align-items:center;" }, q, newBtn),
    listWrap
  );

  let all: Store[] = [];
  function setStores(stores: Store[]) {
    all = stores;
    render();
  }

  q.addEventListener("input", render);

  function render() {
    const term = q.value.trim();
    const filtered = term
      ? all.filter(s =>
          (s.storeCode ?? "").includes(term) ||
          (s.storeName ?? "").includes(term)
        )
      : all;

    listWrap.innerHTML = "";
    if (filtered.length === 0) {
      listWrap.append(el("div", { style: "padding:8px; color:#666;" }, "（該当なし）"));
      return;
    }

    for (const s of filtered) {
      const row = el("button", {
        type: "button",
        style: [
          "display:block",
          "width:100%",
          "text-align:left",
          "padding:8px",
          "border:0",
          "border-bottom:1px solid #f0f0f0",
          "background:white",
          "cursor:pointer",
        ].join(";"),
      },
      `${s.storeCode}  ${s.storeName ?? ""}  ${s.zip ?? ""}`
      ) as HTMLButtonElement;

      row.onclick = () => opts.onSelect(s);
      listWrap.append(row);
    }
  }

  return { root, setStores };
}

function boxStyle() {
  return [
    "border:1px solid #eee",
    "border-radius:8px",
    "padding:10px",
    "margin:12px 0",
  ].join(";");
}
