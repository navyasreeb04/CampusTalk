import { Menu, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const PublicNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="public-topbar">
      <div className="brand-block">
        <div className="brand-icon">
          <Sparkles size={18} />
        </div>
        <div>
          <h1>CampusTalk</h1>
          <p>Campus life, learning, and placements in one calm space</p>
        </div>
      </div>

      <button
        aria-label="Toggle navigation"
        className="ghost-button public-menu-button"
        onClick={() => setMenuOpen((currentState) => !currentState)}
        type="button"
      >
        <Menu size={18} />
      </button>

      <nav className={`public-nav ${menuOpen ? "open" : ""}`}>
        <a href="#modules">Modules</a>
        <Link to="/signup">Create Account</Link>
        <Link className="primary-button" to="/login">
          Login
        </Link>
      </nav>
    </header>
  );
};

export default PublicNavbar;
