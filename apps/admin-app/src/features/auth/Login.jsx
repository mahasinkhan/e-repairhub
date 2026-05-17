import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@repo/ui/LoginForm";
import { login } from "./auth.api.js";

const EXPECTED_ROLE = "admin";

export function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit({ emailOrUsername, password, role }) {
    setError("");
    setLoading(true);
    try {
      if (role !== EXPECTED_ROLE) {
        setError("Invalid role for this panel. Choose Admin or open the correct portal.");
        return;
      }
      const { token, user } = await login({ emailOrUsername, password, role });
      if (user.role !== EXPECTED_ROLE) {
        setError("Invalid role for this panel.");
        return;
      }
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />;
}
