import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/clerk-react";

function Navbar() {
  const location = useLocation();
  const isHomePage = location.pathname === "/"; // Check if we're on the home page

  return (
    <nav
      className="text-white p-4"
      style={{
        backgroundColor: isHomePage ? "rgb(175, 112, 28)" : "rgb(31, 41, 55)", // Default gray color for other pages
      }}
    >
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        {/* Logo with Name to the right */}
        <Link to="/" className="flex items-center space-x-2">
          <img
             src={isHomePage ? "/logo.png" : "/logo2.png"}  // Replace with the actual path to your logo image
            alt="MindSync Logo"
            className="h-10"  // Adjust the height as per your requirement
          />
          <span className="text-2xl font-bold">MindSync</span>
        </Link>

        {/* Navigation Links */}
        <div className="space-x-6 flex items-center">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          <SignedIn>
            <Link to="/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
            <Link to="/tasks" className="hover:text-gray-300">
              Tasks
            </Link>
            <Link to="/focus" className="hover:text-gray-300">
              Focus Mode
            </Link>
            <Link to="/reports" className="hover:text-gray-300">
              Reports
            </Link>
            <Link
              to="/tasks/new"
              className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
            >
              + New Task
            </Link>
            {/* Sign Out Button when signed in */}
            <SignOutButton>
              <button className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition duration-300">
                Sign Out
              </button>
            </SignOutButton>
          </SignedIn>

          {/* Show Sign In Button when signed out */}
          <SignedOut>
            <SignInButton strategy="oauth_google" mode="modal">
              <button className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 transition duration-300">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
