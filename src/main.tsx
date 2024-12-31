import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ReduxProvider from "./providers/reduxProvider.tsx";
import { ModelControlProvider } from "./context.tsx";
import { Toaster } from "./components/ui/toaster.tsx";

createRoot(document.getElementById("root")!).render(
    <ReduxProvider>
      <ModelControlProvider>
        <App />
        <Toaster />
      </ModelControlProvider>
    </ReduxProvider>
);
