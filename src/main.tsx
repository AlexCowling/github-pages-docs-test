import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const mountPoints = document.querySelectorAll<HTMLElement>("[data-react-root]");

mountPoints.forEach((element) => {
  createRoot(element).render(
    <StrictMode>
      <App greeting={element.dataset.greeting ?? "Hello"} />
    </StrictMode>,
  );
});
