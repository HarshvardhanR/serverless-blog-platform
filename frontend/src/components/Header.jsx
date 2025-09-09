import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { User, LogOut, FileText } from "lucide-react"; // Lucide icons

function Header({ user, loadingUser }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const capitalizeFirstLetter = (name) => {
    if (!name) return "User";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <header className="flex justify-between items-center mb-8 relative">
      <h1 className="text-3xl font-bold text-gray-800">
        {loadingUser
          ? "Loading user..."
          : `Welcome, ${capitalizeFirstLetter(user?.name)}!`}
      </h1>

      <div className="flex items-center space-x-4">
        <Link
          to="/my-posts"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transform transition-all"
        >
          <FileText size={18} />
          My Posts
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-700 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transform transition-all"
          >
            {user?.name
              ? capitalizeFirstLetter(user.name).charAt(0)
              : "U"}
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-10 overflow-hidden"
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  <User size={16} />
                  Profile
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Header;
