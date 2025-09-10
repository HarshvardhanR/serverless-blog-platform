import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function UserPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token")?.replace(/"/g, "");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const userRes = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

      
        const postsRes = await axios.get(`${API_BASE_URL}/posts/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const postsWithCount = await Promise.all(
          postsRes.data.map(async (post) => {
            const commentsRes = await axios.get(
              `${API_BASE_URL}/comments/post/${post.postId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...post, commentsCount: commentsRes.data.length };
          })
        );

        setPosts(postsWithCount);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching user or posts:", err);
        setError("Failed to load your posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, API_BASE_URL]);

  if (!token)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        No token found. Please login.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {user ? `${user?.name?.charAt(0).toUpperCase() + user.name.slice(1)}'s Posts` : "My Posts"}
      </h1>

      {error && (
        <div className="text-red-500 bg-red-100 p-3 rounded-lg mb-4 flex justify-between items-center">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="text-red-700 font-semibold hover:underline ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow-md animate-pulse h-28"
            ></div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">
          You haven’t posted anything yet. Start by creating your first post!
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.div
              key={post.postId}
              className="bg-white p-5 rounded-xl shadow-md overflow-hidden cursor-pointer"
              whileHover={{
                y: -5,
                scale: 1.02,
                boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
              }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              onClick={() => navigate(`/posts/${post.postId}`)}
            >
              <h3 className="font-semibold text-gray-800 text-lg mb-2">
                {post.title}
              </h3>
              <div className="text-gray-600 mb-3 line-clamp-2 break-words">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {post.content}
  </ReactMarkdown>
</div>


              <div className="flex justify-between items-center mt-2 text-gray-400 text-sm">
                <div className="flex items-center gap-1">
                  <MessageCircle size={16} /> {post.commentsCount}{" "}
                  {post.commentsCount === 1 ? "comment" : "comments"}
                </div>
                <p className="italic">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserPosts;
