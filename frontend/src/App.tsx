import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes";
import { useAuthStore } from "./stores/authStore";
import { useAppStore } from "./stores/appStore";

const App = () => {
  const initialize = useAuthStore((s) => s.initialize);
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
