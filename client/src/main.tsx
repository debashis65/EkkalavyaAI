import { createRoot } from "react-dom/client";
import App from "./App-fixed";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/theme-provider";
import { SimpleAuthProvider } from "./context/simple-auth";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider defaultTheme="light">
      <SimpleAuthProvider>
        <App />
      </SimpleAuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
