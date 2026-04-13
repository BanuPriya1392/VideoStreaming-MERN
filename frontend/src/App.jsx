import React, { useState, createContext, useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LibraryProvider } from "./context/LibraryContext";
import Layout from "./Components/Layout";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import HomePage from "./Pages/HomePage";
import Explore from "./Pages/Explore";
import CategoryPage from "./Pages/CategoryPage";
import VideoDetail from "./Pages/VideoDetail";
import Profile from "./Pages/Profile";
import Settings from "./Pages/Settings";
import PlaylistsPage from "./Pages/PlaylistsPage";
import WatchlistPage from "./Pages/WatchlistPage";
import History from "./Pages/History";
import Liked from "./Pages/Liked";

// --- AUTH CONTEXT ---
export const AuthContext = createContext();

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user || user.isGuest) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  // Initialize user: Check localStorage, otherwise default to GUEST
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("nexus_user");
    return saved
      ? JSON.parse(saved)
      : { name: "GUEST", email: "guest@nexus.core", isGuest: true };
  });

  const login = (userData) => {
    setUser({ ...userData, isGuest: false });
    localStorage.setItem(
      "nexus_user",
      JSON.stringify({ ...userData, isGuest: false })
    );
  };

  const logout = () => {
    const guestUser = {
      name: "GUEST",
      email: "guest@nexus.core",
      isGuest: true,
    };
    setUser(guestUser);
    localStorage.removeItem("nexus_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <LibraryProvider>
          <Routes>
            {/* 1. Default Entry: Always start at /login */}
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />

            <Route 
              path="/login" 
              element={
                user && !user.isGuest ? <Navigate to="/home" replace /> : <LoginPage />
              } 
            />
            <Route path="/register" element={<RegisterPage />} />

            {/* 2. Protected Routes: Re-routing GUESTs to login */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="home" element={<HomePage />} />
              <Route path="explore" element={<Explore />} />
              <Route
                path="live"
                element={<CategoryPage title="Live Sector" category="Live" />}
              />
              <Route path="history" element={<History />} />
              <Route path="playlists" element={<PlaylistsPage />} />
              <Route path="watchlist" element={<WatchlistPage />} />
              <Route path="liked" element={<Liked />} />
              <Route
                path="gaming"
                element={
                  <CategoryPage title="Gaming Sector" category="Gaming" />
                }
              />
              <Route
                path="music"
                element={<CategoryPage title="Music Sector" category="Music" />}
              />
              <Route
                path="education"
                element={
                  <CategoryPage title="Education Sector" category="Education" />
                }
              />
              <Route
                path="cinema"
                element={
                  <CategoryPage title="Cinema Sector" category="Cinema" />
                }
              />
              <Route
                path="tech"
                element={<CategoryPage title="Tech Sector" category="Tech" />}
              />
              <Route
                path="ai"
                element={<CategoryPage title="AI Sector" category="AI" />}
              />
              <Route
                path="family"
                element={<CategoryPage title="Family Sector" category="Family" />}
              />
              <Route
                path="lifestyle"
                element={<CategoryPage title="Lifestyle Sector" category="Lifestyle" />}
              />
              <Route
                path="science"
                element={<CategoryPage title="Science Sector" category="Science" />}
              />
              <Route
                path="sports"
                element={<CategoryPage title="Sports Sector" category="Sports" />}
              />
              <Route
                path="vlog"
                element={<CategoryPage title="Vlog Sector" category="Vlog" />}
              />
              <Route path="video/:id" element={<VideoDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </LibraryProvider>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
