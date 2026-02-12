// src/components/Sidebar/Sidebar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, UserCog, Upload, Download } from "lucide-react";

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <Users /> },
    { name: "Clients", path: "/clients", icon: <Users /> },
    ...(role === "super_admin" ? [{ name: "Admins", path: "/admins", icon: <UserCog /> }] : []),
    ...(role === "admin" || role === "super_admin"
      ? [
          { name: "Upload Clients", path: "/upload-clients", icon: <Upload /> },
          { name: "Reports", path: "/reports", icon: <Download /> },
        ]
      : []),
    { name: "Profile", path: "/profile", icon: <UserCog /> },
  ];

  return (
    <aside className="sidebar">
      <div className="logo" onClick={() => navigate("/")}>
        <h2>AdminPanel</h2>
      </div>
      <ul>
        {menuItems.map((item) => (
          <li
            key={item.name}
            className={location.pathname === item.path ? "active" : ""}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
