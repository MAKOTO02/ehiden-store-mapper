import { el } from "../dom";
import type { Store } from "../../core/master/types";

export type MasterEditorOptions = {
  onSave: (store: Store) => void;
  onDelete: (storeCode: string) => void;
  onCancel: () => void;
};

export function createMasterEditor(opts: MasterEditorOptions) {
  const root = el("section", { style: boxStyle() });

  const code = textInput("店舗コード（必須）", "例: 171");
  const name = textInput("店舗名", "例: 札幌店");
  const zip  = textInput("郵便番号", "例: 060-0063");
  const addr = textArea("住所（まとめてOK）", "例: 北海道札幌市…");
  const tel  = textInput("電話番号", "例: 011-123-4567");

  const msg = el("div", { style: "color:#a33; font-size:12px; min-height:16px;" }, "");

  const saveBtn = el("button", { type: "button" }, "保存") as HTMLButtonElement;
  const delBtn  = el("button", { type: "button" }, "削除") as HTMLButtonElement;
  const cancelBtn = el("button", { type: "button" }, "キャンセル") as HTMLButtonElement;

  delBtn.disabled = true;

  saveBtn.onclick = () => {
    const storeCode = code.input.value.trim();
    if (!storeCode) {
      msg.textContent = "店舗コードは必須です。";
      return;
    }
    msg.textContent = "";

    const store: Store = {
      storeCode,
      storeName: name.input.value.trim() || undefined,
      zip: zip.input.value.trim() || undefined,
      address: addr.input.value.trim() || undefined,
      tel: tel.input.value.trim() || undefined,
      updatedAt: Date.now(),
    };
    opts.onSave(store);
    setStore(store); // 保存後も表示更新
  };

  delBtn.onclick = () => {
    const storeCode = code.input.value.trim();
    if (!storeCode) return;
    opts.onDelete(storeCode);
    clear();
  };

  cancelBtn.onclick = () => opts.onCancel();

  root.append(
    el("h2", { style: "margin:0 0 8px 0; font-size:16px;" }, "店舗マスタ登録 / 編集"),
    code.root, name.root, zip.root, addr.root, tel.root,
    msg,
    el("div", { style: "display:flex; gap:8px; margin-top:8px;" }, saveBtn, delBtn, cancelBtn),
  );

  function setStore(s: Store) {
    code.input.value = s.storeCode;
    name.input.value = s.storeName ?? "";
    zip.input.value  = s.zip ?? "";
    addr.input.value = s.address ?? "";
    tel.input.value  = s.tel ?? "";
    delBtn.disabled = false;
    code.input.disabled = true; // 主キー固定（編集で事故りにくい）
  }

  function clear() {
    code.input.value = "";
    name.input.value = "";
    zip.input.value = "";
    addr.input.value = "";
    tel.input.value = "";
    msg.textContent = "";
    delBtn.disabled = true;
    code.input.disabled = false;
  }

  return { root, setStore, clear };
}

function textInput(label: string, placeholder: string) {
  const input = el("input", {
    type: "text",
    placeholder,
    style: "width:320px; padding:6px;",
  }) as HTMLInputElement;

  const root = el("label", { style: "display:flex; flex-direction:column; gap:4px; font-size:12px; margin:6px 0;" },
    el("span", { style: "color:#333;" }, label),
    input
  );
  return { root, input };
}

function textArea(label: string, placeholder: string) {
  const input = el("textarea", {
    placeholder,
    style: "width:520px; height:80px; padding:6px; resize:vertical;",
  }) as HTMLTextAreaElement;

  const root = el("label", { style: "display:flex; flex-direction:column; gap:4px; font-size:12px; margin:6px 0;" },
    el("span", { style: "color:#333;" }, label),
    input
  );
  return { root, input };
}

function boxStyle() {
  return [
    "border:1px solid #eee",
    "border-radius:8px",
    "padding:10px",
    "margin:12px 0",
  ].join(";");
}
