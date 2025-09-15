import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null); // null = loading, true = authenticated, false = not authenticated

  useEffect(() => {
    const auth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      
      // If no tokens at all, definitely not authenticated
      if (!token && !refreshToken) {
        console.log("🔑 No tokens found, redirecting to login");
        setIsAuth(false);
        return;
      }
      
      // If no access token but refresh token exists, let API interceptor handle it
      if (!token && refreshToken) {
        console.log("🔑 No access token but refresh token exists, will be handled by API interceptor");
        setIsAuth(true); // Assume authenticated, let API calls trigger refresh
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000; // in seconds

        if (tokenExpiration < now) {
          // Token expired, but let API interceptor handle refresh on first API call
          console.log("🔑 Token expired, will be refreshed on next API call");
          if (refreshToken) {
            setIsAuth(true); // Let the API interceptor handle the refresh
          } else {
            setIsAuth(false); // No way to refresh
          }
        } else {
          // Token is still valid
          // console.log("🔑 Token is valid");
          setIsAuth(true);
        }
      } catch (error) {
        console.error("🔑 Error decoding token:", error);
        // Clear invalid access token but keep refresh token for API interceptor
        localStorage.removeItem(ACCESS_TOKEN);
        if (refreshToken) {
          setIsAuth(true); // Let API interceptor try to refresh
        } else {
          setIsAuth(false);
        }
      }
    };

    // Listen for storage changes (e.g., logout in another tab)
    const handleStorageChange = (e) => {
      if (e.key === ACCESS_TOKEN || e.key === REFRESH_TOKEN) {
        console.log("🔑 Token storage changed, re-evaluating auth");
        auth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    auth().catch((error) => {
      // console.error("🔑 Error during authentication:", error);
      setIsAuth(false);
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Loading state
  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  // Return protected content or redirect to login
  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;