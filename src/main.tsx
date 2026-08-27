import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DEMOS } from "./docs/registry";

const mounts = document.querySelectorAll<HTMLElement>("[data-ti-demo]");

for (const element of mounts) {
  const name = element.dataset.tiDemo ?? "";
  const Demo = DEMOS[name];

  if (!Demo) {
    console.warn(`Unknown data-ti-demo value: ${name}`);
    continue;
  }

  createRoot(element).render(
    <StrictMode>
      <Demo />
    </StrictMode>,
  );
}
