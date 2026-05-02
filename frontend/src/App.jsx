import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import GuestRoute from "./components/GuestRoute";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Chat from "./pages/Chat";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import Explore from "./pages/Explore";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyFeed from "./pages/MyFeed";
import PlacementPulse from "./pages/PlacementPulse";
import Signup from "./pages/Signup";
import SkillMap from "./pages/SkillMap";
import Trending from "./pages/Trending";

const ProtectedLayout = () => (
  <>
    <Navbar />
    <main className="app-shell">
      <Outlet />
    </main>
  </>
);

const CampusBoardRoute = ({ children }) => {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate replace to="/dashboard" />;
  }

  return children;
};

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route
            path="/explore"
            element={
              <CampusBoardRoute>
                <Explore />
              </CampusBoardRoute>
            }
          />
          <Route
            path="/trending"
            element={
              <CampusBoardRoute>
                <Trending />
              </CampusBoardRoute>
            }
          />
          <Route
            path="/myfeed"
            element={
              <CampusBoardRoute>
                <MyFeed />
              </CampusBoardRoute>
            }
          />
          <Route path="/skillmap" element={<SkillMap />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/placements" element={<PlacementPulse />} />
          <Route
            path="/dashboard"
            element={user?.role === "admin" ? <Dashboard /> : <Navigate replace to="/explore" />}
          />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
};

export default App;
