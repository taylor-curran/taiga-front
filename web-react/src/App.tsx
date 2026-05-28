import { RouterProvider } from "react-router-dom";
import { buildRouter } from "./router";
import { getConfig } from "./config";
import { useMemo } from "react";

export default function App() {
  const router = useMemo(() => buildRouter(), []);
  const config = getConfig();

  return (
    <div data-theme={config.defaultTheme || "taiga"}>
      <RouterProvider router={router} />
    </div>
  );
}
