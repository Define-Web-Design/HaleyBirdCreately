import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

import './styles/apple-animations.css';
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary fallback={<div>Something went wrong. Please refresh the page.</div>}>
        <App />
      </ErrorBoundary>
    );
    
    console.log("Application successfully mounted");
  } catch (error) {
    console.error("Error rendering the application:", error);
    
    // Emergency fallback rendering
    rootElement.innerHTML = `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1>Creately</h1>
        <p>There was a problem loading the application. Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #F2994A; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
} else {
  console.error("Root element not found!");
}
