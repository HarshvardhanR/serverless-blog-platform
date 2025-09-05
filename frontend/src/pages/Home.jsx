import { useState, useEffect } from "react";
import axios from "axios";

function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("https://your-api-endpoint.com/posts");
        setPosts(res.data);
      } catch (err) {
        console.log("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, []);

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
      setError("Signup failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-16 pb-12 px-4">
      {/* Blog Name */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">SkyPosts</h1>
        <p className="text-gray-600 text-lg">Share your thoughts with the world</p>
      </header>

      {/* Login/Signup Card */}
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md transition-all duration-300">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          {isLogin ? "Login" : "Signup"}
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {message && <p className="text-green-500 mb-4">{message}</p>}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none bg-white placeholder-gray-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none bg-white placeholder-gray-500"
            />
            <button
              type="submit"
              className="w-full p-4 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-6">
            <input
              type="text"
              placeholder="Name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              required
              className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none bg-white placeholder-gray-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
              className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none bg-white placeholder-gray-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
              className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none bg-white placeholder-gray-500"
            />
            <button
              type="submit"
              className="w-full p-4 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              Signup
            </button>
          </form>
        )}

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
      </div>
    </div>
  );
}

export default Home;
