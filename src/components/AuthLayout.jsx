import { Outlet } from "react-router";
import { useState, useEffect } from "react";
import { Navigate } from "react-router";

export const AuthLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(token !== null);
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/home" />;
  }

  return (
    <>
      <Outlet />
    </>
  );
};
