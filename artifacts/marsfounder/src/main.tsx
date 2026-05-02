import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

// In production, VITE_API_URL is the absolute URL of the API server
// (e.g. https://api.marsfounder.io). In dev, leave it unset — the Vite
// proxy forwards /api/* to localhost:3000 automatically.
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
