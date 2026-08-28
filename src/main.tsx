import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DEMOS } from "./docs/registry";

const mounts = document.querySelectorAll<HTMLElement>("[data-ds-demo]");

for (const element of mounts) {
  const name = element.dataset.dsDemo ?? "";
  const Demo = DEMOS[name];

  if (!Demo) {
    console.warn(`Unknown data-ds-demo value: ${name}`);
    continue;
  }

  createRoot(element).render(
    <StrictMode>
      <Demo />
    </StrictMode>,
  );
}
