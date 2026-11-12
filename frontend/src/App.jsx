import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    return Boolean(token && token !== "undefined" && token !== "null");
  });

  return auth ? (
    <Dashboard setAuth={setAuth} />
  ) : (
    <Login setAuth={setAuth} />
  );
}

export default App;