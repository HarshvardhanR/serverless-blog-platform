import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(""); // User name
  const [posts, setPosts] = useState([]);

  // Check login and fetch posts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      setUser("John Doe");

      const fetchPosts = async () => {
        try {
          const res = await axios.get(
            "https://your-api-endpoint.com/posts",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setPosts(res.data);
        } catch (err) {
          console.log("Error fetching posts:", err);
        }
      };
      fetchPosts();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user}!</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Create Post Card */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 max-w-xl">
        <h2 className="text-xl font-semibold mb-4">Create a New Post</h2>
        <button
          onClick={() => alert("Open create post modal/page")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          New Post
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4 max-w-2xl">
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. Start sharing your thoughts!</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-800">{post.title}</h3>
              <p className="text-gray-600 mt-1">{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
