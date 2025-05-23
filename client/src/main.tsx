import { createRoot } from "react-dom/client";
import App from "./App-clean";
import "./index.css";
import { ThemeProvider } from "./context/theme-provider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light">
    <App />
  </ThemeProvider>
);
