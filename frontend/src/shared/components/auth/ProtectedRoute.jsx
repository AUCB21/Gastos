import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../../../constants";
import { useState, useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null); // null = loading, true = authenticated, false = not authenticated

  useEffect(() => {
    const auth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      
      if (!token && !refreshToken) {
        setIsAuth(false);
        return;
      }
      
      if (!token && refreshToken) {
        setIsAuth(true);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
          if (refreshToken) {
            try {
              const refreshDecoded = jwtDecode(refreshToken);
              const refreshExpiration = refreshDecoded.exp;
              
              if (refreshExpiration < now) {
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
                setIsAuth(false);
              } else {
                setIsAuth(true);
              }
            } catch {
              localStorage.removeItem(ACCESS_TOKEN);
              localStorage.removeItem(REFRESH_TOKEN);
              setIsAuth(false);
            }
          } else {
            setIsAuth(false);
          }
        } else {
          setIsAuth(true);
        }
      } catch {
        localStorage.removeItem(ACCESS_TOKEN);
        if (refreshToken) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === ACCESS_TOKEN || e.key === REFRESH_TOKEN) {
        auth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    auth().catch(() => {
      setIsAuth(false);
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;