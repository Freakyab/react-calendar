import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ReduxProvider from "./providers/reduxProvider.tsx";
import { ModelControlProvider } from "./context.tsx";

createRoot(document.getElementById("root")!).render(
    <ReduxProvider>
      <ModelControlProvider>
        <App />
      </ModelControlProvider>
    </ReduxProvider>
);
