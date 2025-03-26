// src/components/PrivateRoute.jsx
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth(); // Add isLoaded to check loading

  // 1. Prevent rendering or redirect until Clerk is loaded
  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // 2. If the user is not signed in, redirect to /sign-in
  if (!isSignedIn) {
    console.warn("User not signed in. Redirecting to /sign-in.");
    return <Navigate to="/sign-in" replace />;
  }

  // 3. Render the protected component after successful auth
  return children;
};

export default PrivateRoute;
