import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ConfigProvider, theme as antdTheme } from "antd";
import AppRoutes from "./routes/AppRoutes";
import useStore from "./store/UseStore";

const App = () => {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <Router>
        <AppRoutes />
      </Router>
    </ConfigProvider>
  );
};

export default App;
