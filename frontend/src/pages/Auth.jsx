import { useState, useEffect } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import "./Auth.css";

const Auth = () => {
  const location = useLocation();
  const isSignIn = location.pathname === "/sign-in";
  const [loading, setLoading] = useState(false);

  // Handle loading during sign-in/sign-up
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Delay to show spinner briefly
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex justify-center items-center min-h-screen mt-[-40px]">
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {isSignIn ? (
            <SignIn redirectUrl="/dashboard" />
          ) : (
            <SignUp redirectUrl="/dashboard" />
          )}
        </>
      )}
    </div>
  );
}

export default Auth;
