import { useState } from "react";
import axios from "axios";

export default function Login({ setAuth }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!username.trim() || !password) {
      setError("Username and password are required");
      return;
    }

    try {
      if (isRegister) {
        await axios.post("http://127.0.0.1:8000/register/", {
          username: username.trim(),
          password,
        });
        setMessage("Account created! You can now log in.");
        setIsRegister(false);
        setPassword("");
        return;
      }

      const res = await axios.post("http://127.0.0.1:8000/login/", {
        username: username.trim(),
        password,
      });

      if (!res.data?.access) {
        setError(res.data?.error || "Invalid credentials");
        return;
      }

      localStorage.setItem("token", res.data.access);
      setAuth(true);
    } catch (err) {
      if (!err.response) {
        setError("Backend server not running");
      } else {
        setError(err.response.data?.error || "Authentication failed");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-80"
      >
        <h2 className="text-xl font-bold mb-4 text-center">
          {isRegister ? "Register" : "Login"}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 mb-3 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-700 text-sm p-2 mb-3 rounded">
            {message}
          </div>
        )}

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full border p-2 pr-14 rounded"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-medium cursor-pointer"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded cursor-pointer"
        >
          {isRegister ? "Create Account" : "Login"}
        </button>

        {!isRegister && (
          <div className="mt-3 p-2 bg-gray-50 border rounded text-xs text-gray-700">
            <div className="font-semibold mb-1">Admin Login Credentials:</div>
            <div>Username: <code>admin</code></div>
            <div>Password: <code>admin123</code></div>
            <button
              type="button"
              onClick={() => {
                setUsername("admin");
                setPassword("admin123");
                setError("");
              }}
              className="mt-1 text-blue-600 underline cursor-pointer"
            >
              Fill admin credentials
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
            setMessage("");
          }}
          className="w-full text-sm text-blue-600 mt-3 cursor-pointer"
        >
          {isRegister
            ? "Already have an account? Login"
            : "Need an account? Register"}
        </button>
      </form>
    </div>
  );
}
