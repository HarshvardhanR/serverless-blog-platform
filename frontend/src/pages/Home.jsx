import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import blackDunes from "../assets/images/black-dunes.webp";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

function Home() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await axios.post(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/auth/login",
        { email: loginEmail, password: loginPassword }
      );
      localStorage.setItem("token", res.data.token);
      setMessage("Login successful!");
      navigate("/dashboard");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Invalid login credentials.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await axios.post(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/auth/register",
        { name: signupName, email: signupEmail, password: signupPassword }
      );

      setMessage("Signup successful! You can now login.");
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setIsLogin(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Email already exists. Please login instead.");
      } else {
        setError("Signup failed. Try again.");
      }
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center pt-16 pb-12 px-4 overflow-hidden"
      style={{
        backgroundImage: `url(${blackDunes})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo/Header */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            SkyPosts
          </h1>
          <p className="text-white/80 text-base mt-2">
            Share your thoughts with the world
          </p>
        </header>

        {/* Auth Card */}
        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ duration: 0.3 }}
          className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20"
        >
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            {isLogin ? "Login" : "Signup"}
          </h2>

          {error && <p className="text-red-500 mb-3">{error}</p>}
          {message && <p className="text-green-600 mb-3">{message}</p>}

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                onSubmit={handleLogin}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 bg-white/90 placeholder-gray-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 bg-white/90 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="w-full p-3 rounded-lg bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold hover:from-gray-800 hover:to-gray-600 transition-all"
                >
                  Login
                </button>
              </motion.form>
            ) : (
              <motion.form
                onSubmit={handleSignup}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <input
                  type="text"
                  placeholder="Name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 bg-white/90 placeholder-gray-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 bg-white/90 placeholder-gray-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 bg-white/90 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="w-full p-3 rounded-lg bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold hover:from-gray-800 hover:to-gray-600 transition-all"
                >
                  Signup
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Toggle */}
          <p className="text-center mt-6 text-gray-600 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setMessage("");
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              {isLogin ? "Signup" : "Login"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
