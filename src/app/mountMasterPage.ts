// src/app/mountMasterPage.ts

import { el } from "../ui/dom";
import { createMasterView } from "../ui/master/masterView";
import { createMasterEditor } from "../ui/master/masterEditor";
import { listStores, upsertStore, deleteStore } from "../core/master/storeRepo";

export function mountMasterPage(root: HTMLElement): () => void {
  // 先に宣言して、masterView のコールバックから参照できるようにする
  let editorApi: ReturnType<typeof createMasterEditor>;

  const masterView = createMasterView({
    onSelect: (s) => editorApi.setStore(s),
    onCreateNew: () => editorApi.clear(),
  });

  editorApi = createMasterEditor({
    onSave: (s) => {
      upsertStore(s);
      masterView.setStores(listStores());
      editorApi.setStore(s); // 保存後の内容を維持（任意）
    },
    onDelete: (storeCode) => {
      deleteStore(storeCode);
      masterView.setStores(listStores());
      editorApi.clear();
    },
    onCancel: () => editorApi.clear(),
  });

  // 初期ロード
  masterView.setStores(listStores());

  root.append(
    el("h2", { style: "margin:0 0 8px 0;" }, "マスタ管理"),
    el(
      "div",
      { style: "display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap;" },
      masterView.root,
      editorApi.root
    )
  );

  return () => {
    // ページ切替するなら、DOMを片付ける程度でOK
    root.innerHTML = "";
  };
}
