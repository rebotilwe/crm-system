import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-logo">CRM System</h1>
      </div>
      <div className="navbar-right">
        <span className="navbar-user">Hello, {name}</span>
        <button className="navbar-logout" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
