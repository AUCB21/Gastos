import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null); // null = loading, true = authenticated, false = not authenticated

  const refreshToken = async () => {
    const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN);
    
    if (!refreshTokenValue) {
      console.log("🔑 No refresh token found");
      setIsAuth(false);
      return;
    }

    try {
      console.log("🔑 Attempting to refresh token");
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshTokenValue,
      });
      
      if (res.status === 200) {
        console.log("🔑 Token refreshed successfully");
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuth(true);
      } else {
        console.log("🔑 Token refresh failed with status:", res.status);
        localStorage.clear();
        setIsAuth(false);
      }
    } catch (error) {
      console.error("🔑 Error refreshing token:", error);
      // Clear all tokens if refresh fails
      localStorage.clear();
      setIsAuth(false);
    }
  };

  useEffect(() => {
    const auth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      
      if (!token) {
        console.log("🔑 No access token found, redirecting to login");
        setIsAuth(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000; // in seconds

        if (tokenExpiration < now) {
          // Token expired, try to refresh
          console.log("🔑 Token expired, attempting refresh");
          await refreshToken();
        } else {
          // Token is still valid
          console.log("🔑 Token is valid");
          setIsAuth(true);
        }
      } catch (error) {
        console.error("🔑 Error decoding token:", error);
        // Clear invalid token
        localStorage.removeItem(ACCESS_TOKEN);
        setIsAuth(false);
      }
    };

    auth().catch((error) => {
      console.error("🔑 Error during authentication:", error);
      setIsAuth(false);
    });
  }, []);

  // Loading state
  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  // Return protected content or redirect to login
  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;