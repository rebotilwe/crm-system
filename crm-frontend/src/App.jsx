// src/App.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import Search from "./pages/Search/Search";
import Profile from "./pages/Profile/Profile";
import AddClient from "./pages/AddClient/AddClient";
import EditClient from "./pages/EditClient/EditClient";
import UploadClients from "./pages/UploadClients/UploadClients";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard"; // Import Dashboard directly
import Admins from "./pages/Admins/Admins";
import Reports from "./pages/Reports/Reports";
import UserProfile from "./pages/UserProfile/UserProfile"

function App() {
  return (
    <Routes>
      {/* Public Routes - NO LAYOUT */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes - ALL wrapped in ProtectedRoute which includes DashboardLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        }
      />

      <Route
        path="/client/:id"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      

      <Route
        path="/add-client"
        element={
          <ProtectedRoute>
            <AddClient />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-client/:id"
        element={
          <ProtectedRoute>
            <EditClient />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload-clients"
        element={
          <ProtectedRoute>
            <UploadClients />
          </ProtectedRoute>
        }
      />
      // Add this route with your other protected routes:
<Route
  path="/reports"
  element={
    <ProtectedRoute>
      <Reports />
    </ProtectedRoute>
  }
/>
<Route
  path="/userProfile"
  element={
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  }
/>

      <Route
        path="/admins"
        element={
          <ProtectedRoute>
            <Admins />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;