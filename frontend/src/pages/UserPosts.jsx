import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

function UserPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const API_BASE_URL = import.meta.env.API_BASE_URL

  const navigate = useNavigate();
  const token = localStorage.getItem("token")?.replace(/"/g, "");

  const fetchUser = async () => {
    if (!token) return setError("No token provided");
    try {
      const res = await axios.get(
        `${API_BASE_URL}/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
    } catch (err) {
      console.error("❌ Error fetching user:", err);
      setError("Failed to fetch user info");
    }
  };

  const fetchUserPosts = async () => {
    if (!token) return setError("No token provided");
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/posts/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch comment counts for each post
      const postsWithCount = await Promise.all(
        res.data.map(async (post) => {
          const commentsRes = await axios.get(
            `${API_BASE_URL}/comments/post/${post.postId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return { ...post, commentsCount: commentsRes.data.length };
        })
      );

      setPosts(postsWithCount);
    } catch (err) {
      console.error("❌ Error fetching user posts:", err);
      setError("Failed to fetch posts (Unauthorized?)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchUserPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        No token found. Please login.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
  {user
    ? `${user.name.charAt(0).toUpperCase() + user.name.slice(1)}'s Posts`
    : "My Posts"}
</h1>


      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>
      )}

      {loading ? (
        <p className="text-gray-600">Loading your posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">
          You haven’t posted anything yet. Start by creating your first post!
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.div
              key={post.postId}
              className="bg-white p-5 rounded-xl shadow-md overflow-hidden"
              whileHover={{
                y: -5,
                scale: 1.02,
                boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
              }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
            >
              <h3
                className="font-semibold text-gray-800 text-lg mb-2 cursor-pointer"
                onClick={() => navigate(`/posts/${post.postId}`)}
              >
                {post.title}
              </h3>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {post.content.length > 100
                  ? post.content.substring(0, 100) + "..."
                  : post.content}
              </p>

              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={() => navigate(`/posts/${post.postId}`)}
                  className="flex items-center gap-1 text-blue-500 hover:underline"
                >
                  <MessageCircle size={16} /> Read More
                </button>
                <p className="text-gray-400 text-sm flex gap-2 items-center">
                  {post.commentsCount}{" "}
                  {post.commentsCount === 1 ? "comment" : "comments"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserPosts;
