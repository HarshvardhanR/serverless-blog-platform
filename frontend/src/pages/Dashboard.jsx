import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PostForm from "../components/PostForm";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(""); 
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Check login and fetch posts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      setUser("John Doe"); // replace with real user from backend

      const fetchPosts = async () => {
        try {
          const res = await axios.get(
            "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/posts",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setPosts(res.data);
        } catch (err) {
          console.log("Error fetching posts:", err);
        } finally {
          setLoadingPosts(false);
        }
      };
      fetchPosts();
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Callback when a new post is created
  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]); // prepend the new post
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

      {/* Create Post Form */}
      <PostForm onPostCreated={handlePostCreated} />

      {/* Posts List */}
      <div className="space-y-4 max-w-2xl mt-8">
        {loadingPosts ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. Start sharing your thoughts!</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.postId}
              className="bg-white p-4 rounded-xl shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => navigate(`/posts/${post.postId}`)}
            >
              <h3 className="font-semibold text-gray-800">{post.title}</h3>
              <p className="text-gray-600 mt-1">{post.content.substring(0, 100)}...</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
