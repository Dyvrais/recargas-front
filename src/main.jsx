import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SWRConfig } from "swr";
import fetcher from "./lib/fetcher";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SWRConfig
      value={{
        fetcher,
        dedupingInterval: 120000,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
      }}
    >
      <App />
    </SWRConfig>
  </StrictMode>,
);
