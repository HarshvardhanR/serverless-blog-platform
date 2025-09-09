import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PostForm from "../components/PostForm";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState(null);

  const token = localStorage.getItem("token");

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/auth/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      localStorage.removeItem("token");
      navigate("/");
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await axios.get(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/posts",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setErrorPosts("Failed to load posts.");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchUser();
    fetchPosts();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    console.log("New post created!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-8 relative">
        <h1 className="text-3xl font-bold text-gray-800">
          {loadingUser ? "Loading user..." : `Welcome, ${user?.name || "User"}!`}
        </h1>

        <div className="flex items-center space-x-4">
          <Link
            to="/my-posts"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            My Posts
          </Link>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Post Form */}
      <section className="mt-8 mb-12">
        <PostForm onPostCreated={handlePostCreated} />
      </section>

      {/* Feed */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Feed</h2>

        {loadingPosts && <p>Loading posts...</p>}
        {errorPosts && <p className="text-red-500">{errorPosts}</p>}
        {!loadingPosts && posts.length === 0 && <p>No posts available.</p>}

        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.postId}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full max-h-64 object-cover mb-4 rounded-lg"
                />
              )}

              <div className="text-gray-700 mb-2 prose max-w-full">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content.length > 200
                    ? post.content.slice(0, 200) + "..."
                    : post.content}
                </ReactMarkdown>
              </div>

              <div className="flex justify-between items-center mt-4">
                <Link
                  to={`/post/${post.postId}`}
                  className="text-blue-500 hover:underline"
                >
                  Read More
                </Link>
                <p className="text-gray-400 text-sm">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
