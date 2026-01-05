import { createRoot } from "react-dom/client";
import CodeEditor from "./App";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<CodeEditor />);
}
