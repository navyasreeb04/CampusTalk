import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginMode, setLoginMode] = useState("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((currentData) => ({
      ...currentData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      const { data } = await api.post("/auth/login", {
        ...formData,
        loginMode,
      });
      login(data);
      navigate(data.user.role === "admin" ? "/dashboard" : "/explore");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <Link className="back-link" to="/">
          <ArrowLeft size={16} />
          Back to landing page
        </Link>

        <div className="auth-heading">
          <p className="eyebrow">Welcome back</p>
          <h1>Choose how you want to enter CampusTalk</h1>
          <p className="auth-copy">
            {/* Student and admin logins live in separate interfaces so each person sees the right
            path from the start. */}
          </p>
        </div>

        <div className="auth-mode-switch">
          <button
            className={`auth-mode-pill ${loginMode === "student" ? "active" : ""}`}
            onClick={() => setLoginMode("student")}
            type="button"
          >
            Student Login
          </button>
          <button
            className={`auth-mode-pill ${loginMode === "admin" ? "active" : ""}`}
            onClick={() => setLoginMode("admin")}
            type="button"
          >
            Admin Login
          </button>
        </div>

        <div className="auth-tone-card">
          <span>{loginMode === "admin" ? "Admin access" : "Student access"}</span>
          <p>
            {loginMode === "admin"
              ? "Use the admin account you created with the admin passcode during signup."
              : "Use your personal Gmail or any email you used while creating your student account."}
          </p>
        </div>

        <label>
          {loginMode === "admin" ? "Admin email" : "Email"}
          <input
            name="email"
            onChange={handleChange}
            placeholder="yourname@gmail.com"
            type="email"
            value={formData.email}
            required
          />
        </label>

        <label>
          {loginMode === "admin" ? "Admin password" : "Password"}
          <input
            name="password"
            onChange={handleChange}
            placeholder="Enter password"
            type="password"
            value={formData.password}
            required
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="primary-button auth-button" disabled={loading} type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>

          <div className="auth-footer-links">
            <Link className="forgot-link" to="/forgot-password">Forgot Password?</Link>
            <p className="muted-text auth-footnote">
              New here? <Link to="/signup">Create an account</Link>
            </p>
          </div>
      </form>
    </div>
  );
};

export default Login;
