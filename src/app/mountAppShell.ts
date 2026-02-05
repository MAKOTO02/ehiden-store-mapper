import { el } from "../ui/dom";
import { mountImportPage } from "./mountImportPage";
import { mountMasterPage } from "./mountMasterPage";

export function mountAppShell(app: HTMLElement) {
  const nav = el("nav", { style: "margin-bottom:12px;" });
  const btnImport = el("button", {}, "CSV取り込み");
  const btnMaster = el("button", {}, "マスタ管理");

  const pageWrap = el("div");

  nav.append(btnImport, btnMaster);
  app.append(
    el("h1", {}, "e飛伝Ⅲ 店舗コード変換ツール"),
    nav,
    pageWrap
  );

  let unmount: (() => void) | null = null;

  function show(page: "import" | "master") {
    pageWrap.innerHTML = "";
    unmount?.();

    unmount =
      page === "import"
        ? mountImportPage(pageWrap)
        : mountMasterPage(pageWrap);
  }

  btnImport.onclick = () => show("import");
  btnMaster.onclick = () => show("master");

  show("import");
}
