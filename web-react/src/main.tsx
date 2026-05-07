import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

import "./i18n";
import "./styles/global.css";
import { AuthProvider } from "./contexts/auth";
import { ProjectProvider } from "./contexts/project";
import router from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProjectProvider>
          <RouterProvider router={router} />
        </ProjectProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
