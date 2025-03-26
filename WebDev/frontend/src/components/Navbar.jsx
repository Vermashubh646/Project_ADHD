import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/clerk-react";

function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          MindSync
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
            <SignInButton>
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
