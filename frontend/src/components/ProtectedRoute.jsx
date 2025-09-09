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
      setIsAuth(false);
      return;
    }

    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshTokenValue,
      });
      
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setIsAuth(false);
    }
  };

  useEffect(() => {
    const auth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      
      if (!token) {
        setIsAuth(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000; // in seconds

        if (tokenExpiration < now) {
          // Token expired, try to refresh
          await refreshToken();
        } else {
          // Token is still valid
          setIsAuth(true);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsAuth(false);
      }
    };

    auth().catch((error) => {
      setIsAuth(false);
      console.error("Error during authentication:", error);
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