import { useEffect, useState, createContext, useContext } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import ApiBaseUrl from "../ApiBaseUrl";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUserRole = localStorage.getItem("role");
    const storedToken = localStorage.getItem("authToken");
    return storedUserRole && storedToken
      ? { role: storedUserRole, token: storedToken }
      : null;
  });

  const login = (role, token) => {
    setUser({ role, token });
    localStorage.setItem("role", role);
    localStorage.setItem("authToken", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  const verifyToken = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      logout();
      return false;
    }

    try {
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(
        `http://${baseUrl}/api/v1/verify-token?token=${token}`
      );

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      const data = await response.json();
      console.log("Token verified:", data);
      return true;
    } catch (error) {
      console.error("Token verification failed:", error);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const RequireAuth = () => {
  const { user, verifyToken } = useAuth();
  const location = useLocation();
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const valid = await verifyToken();
      setIsVerified(valid);
      setIsChecking(false);
    };

    checkToken();
  }, [verifyToken]);

  if (isChecking) {
    // Show a loading screen while verifying the token
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h2>Validating your session...</h2>
      </div>
    );
  }

  if (!user || !isVerified) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
