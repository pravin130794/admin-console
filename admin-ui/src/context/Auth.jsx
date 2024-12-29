import { createContext, useContext, useState } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";


const AuthContext = createContext(null);


export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user from localStorage
    const storedUserRole = localStorage.getItem("role");
    return storedUserRole ? storedUserRole : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("role", userData); // Persist user
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// RequireAuth to Protect Routes
export const RequireAuth = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login" // Redirect to login page
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
};
