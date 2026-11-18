import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useState } from "react";
import { AntdDesignSystemProvider } from "./design-system/antd-provider";
import { createAppQueryClient } from "./lib/query-client";
import { appRouter } from "./router";

export function App() {
  const [queryClient] = useState(() => createAppQueryClient());

  return (
    <AntdDesignSystemProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={appRouter} />
      </QueryClientProvider>
    </AntdDesignSystemProvider>
  );
}
