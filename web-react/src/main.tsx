import React from "react";
import ReactDOM from "react-dom/client";
import { loadConfig } from "./config";
import App from "./App";

async function bootstrap() {
  await loadConfig();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
