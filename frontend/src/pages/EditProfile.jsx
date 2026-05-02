import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [profileRole, setProfileRole] = useState(user?.role || "student");
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setPageLoading(true);
        setError("");
        const { data } = await api.get("/users/me");

        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
        });
        setProfileRole(data.user.role || "student");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load your profile");
      } finally {
        setPageLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    setFormData((currentState) => ({
      ...currentState,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await api.put("/users/update", formData);
      updateUser(data.user);
      setProfileRole(data.user.role || "student");
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <button className="back-link" onClick={() => navigate(-1)} type="button">
          <ArrowLeft size={16} />
          Go back
        </button>

        <div className="auth-heading">
          <p className="eyebrow">Account Settings</p>
          <h1>Edit Profile</h1>
          <p className="auth-copy">Update your personal information</p>
        </div>

        {pageLoading ? (
          <p className="muted-text">Loading your profile details...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Full Name
              <input
                name="name"
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                type="text"
                value={formData.name}
              />
            </label>

            <label>
              Email Address
              <input
                name="email"
                onChange={handleChange}
                placeholder="yourname@example.com"
                required
                type="email"
                value={formData.email}
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

            <div className="profile-role-display">
              <span className="eyebrow">Role</span>
              <p>{profileRole === "admin" ? "Admin" : "Student"}</p>
              <small>Role cannot be changed</small>
            </div>

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <button className="primary-button auth-button" disabled={loading} type="submit">
              <Save size={16} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
