import { mountAppShell } from "./app/mountAppShell";

const app = document.getElementById("app");
if (!app) throw new Error("#app not found");

mountAppShell(app);
