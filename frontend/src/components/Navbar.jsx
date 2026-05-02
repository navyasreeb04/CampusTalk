import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronDown,
  Compass,
  GraduationCap,
  House,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  MoonStar,
  SunMedium,
  User,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const profileRef = useRef(null);
  const boardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (boardRef.current && !boardRef.current.contains(event.target)) {
        setBoardOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setBoardOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) {
      return "?";
    }

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdmin = user?.role === "admin";
  const isCampusBoardRoute = ["/explore", "/trending", "/myfeed"].includes(location.pathname);
  const navItems = [
    { to: "/home", label: "Home", icon: House },
    { to: "/skillmap", label: "SkillMap", icon: GraduationCap },
    { to: "/placements", label: "PlacementPulse", icon: BriefcaseBusiness },
  ];

  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-icon">
          <LayoutGrid size={16} />
        </div>
        <div className="brand-copy">
          <h1>CampusTalk</h1>
        </div>
      </div>

      <nav className="topnav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to={to}
          >
            <Icon size={15} />
            <span>{label}</span>
          </NavLink>
        ))}

        {!isAdmin ? (
          <div className="nav-dropdown" ref={boardRef}>
            <button
              className={`nav-link nav-dropdown-btn ${isCampusBoardRoute ? "active" : ""}`}
              onClick={() => setBoardOpen((currentState) => !currentState)}
              type="button"
            >
              <Compass size={15} />
              <span>CampusBoard</span>
              <ChevronDown
                className={boardOpen ? "dropdown-chevron open" : "dropdown-chevron"}
                size={15}
              />
            </button>

            <div className={`nav-dropdown-menu ${boardOpen ? "open" : ""}`}>
              <NavLink
                className={({ isActive }) => `nav-dropdown-link ${isActive ? "active" : ""}`}
                to="/explore"
              >
                Explore
              </NavLink>
              <NavLink
                className={({ isActive }) => `nav-dropdown-link ${isActive ? "active" : ""}`}
                to="/trending"
              >
                Trending
              </NavLink>
              <NavLink
                className={({ isActive }) => `nav-dropdown-link ${isActive ? "active" : ""}`}
                to="/myfeed"
              >
                MyFeed
              </NavLink>
            </div>
          </div>
        ) : null}

        {isAdmin ? (
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            to="/dashboard"
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </NavLink>
        ) : null}
      </nav>

      <div className="topbar-actions">
        <div className="profile-dropdown" ref={profileRef}>
          <button
            className="profile-trigger"
            onClick={() => setProfileOpen((currentState) => !currentState)}
            type="button"
          >
            <div className="profile-avatar">{getInitials(user?.name)}</div>
            <div className="profile-trigger-copy">
              <span>{user?.name || "Campus user"}</span>
              <small>{isAdmin ? "Admin" : "Student"}</small>
            </div>
            <ChevronDown
              className={profileOpen ? "dropdown-chevron open" : "dropdown-chevron"}
              size={15}
            />
          </button>

          <div className={`profile-menu ${profileOpen ? "open" : ""}`}>
            <div className="profile-header">
              <div className="profile-avatar-lg">{getInitials(user?.name)}</div>
              <div className="profile-info">
                <h4>{user?.name}</h4>
                <p title={user?.email}>{user?.email}</p>
                <span className="profile-role">{isAdmin ? "Admin" : "Student"}</span>
              </div>
            </div>

            <div className="dropdown-divider" />

            <div className="profile-actions">
              <button
                className="profile-action-btn"
                onClick={() => navigate("/edit-profile")}
                type="button"
              >
                <User size={15} />
                <span>Edit Profile</span>
              </button>
              <button
                className="profile-action-btn"
                onClick={() => navigate("/change-password")}
                type="button"
              >
                <KeyRound size={15} />
                <span>Change Password</span>
              </button>
            </div>

            <div className="dropdown-divider" />

            <div className="theme-switch-row">
              <div className="theme-switch-copy">
                <span>Theme</span>
                <small>{isDarkTheme ? "Dark neon" : "Light pastel"}</small>
              </div>
              <button
                aria-label="Toggle theme"
                className={`theme-toggle ${isDarkTheme ? "dark" : "light"}`}
                onClick={toggleTheme}
                type="button"
              >
                <span className="theme-toggle-option">
                  <SunMedium size={13} />
                  Light
                </span>
                <span className="theme-toggle-option">
                  <MoonStar size={13} />
                  Dark
                </span>
                <span className="theme-toggle-thumb" />
              </button>
            </div>

            <div className="dropdown-divider" />

            <div className="profile-footer">
              <button className="logout-btn" onClick={handleLogout} type="button">
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
