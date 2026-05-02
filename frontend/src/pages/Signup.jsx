import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [signupMode, setSignupMode] = useState("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    adminPasscode: "",
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
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        roleIntent: signupMode,
      };

      if (signupMode === "admin") {
        payload.adminPasscode = formData.adminPasscode;
      }

      const { data } = await api.post("/auth/register", payload);
      login(data);
      navigate(data.user.role === "admin" ? "/dashboard" : "/explore");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account");
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
          <p className="eyebrow">Join CampusTalk</p>
          <h1>Create the right kind of account for your role</h1>
          <p className="auth-copy">
            {/* Students can sign up with personal Gmail. Admins use the admin interface and a passcode
            during signup. */}
          </p>
        </div>

        <div className="auth-mode-switch">
          <button
            className={`auth-mode-pill ${signupMode === "student" ? "active" : ""}`}
            onClick={() => setSignupMode("student")}
            type="button"
          >
            Student Signup
          </button>
          <button
            className={`auth-mode-pill ${signupMode === "admin" ? "active" : ""}`}
            onClick={() => setSignupMode("admin")}
            type="button"
          >
            Admin Signup
          </button>
        </div>

        <div className="auth-tone-card">
          <span>{signupMode === "admin" ? "Admin onboarding" : "Student onboarding"}</span>
          <p>
            {signupMode === "admin"
              ? "Admin signup uses the passcode the account to be created."
              : "Use your own Gmail or any email you prefer. This will be your login credential for student access."}
          </p>
        </div>

        <label>
          Name
          <input
            name="name"
            onChange={handleChange}
            placeholder="Your name"
            type="text"
            value={formData.name}
          />
        </label>

        <label>
          Email
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
          Phone Number (Optional)
          <input
            name="phone"
            onChange={handleChange}
            placeholder="+91 9876543210"
            type="tel"
            value={formData.phone}
          />
        </label>

        <label>
          {signupMode === "admin" ? "Admin password" : "Password"}
          <input
            name="password"
            onChange={handleChange}
            placeholder="Create password"
            type="password"
            value={formData.password}
            required
          />
        </label>

        {signupMode === "admin" ? (
          <label>
            Admin passcode
            <input
              name="adminPasscode"
              onChange={handleChange}
              placeholder="Enter admin passcode"
              type="password"
              value={formData.adminPasscode}
              required
            />
          </label>
        ) : null}

        {error && <p className="error-text">{error}</p>}

        <button className="primary-button auth-button" disabled={loading} type="submit">
          {loading ? "Creating..." : signupMode === "admin" ? "Create admin account" : "Sign up"}
        </button>

        <p className="muted-text auth-footnote">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
