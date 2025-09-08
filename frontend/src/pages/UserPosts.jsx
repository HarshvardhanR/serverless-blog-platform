import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function UserPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null); // <-- track errors
  const navigate = useNavigate();

  const token = localStorage.getItem("token")?.replace(/"/g, "");

  // Fetch user info
  const fetchUser = async () => {
    if (!token) return setError("No token provided");

    try {
      const res = await axios.get(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/auth/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to fetch user info");
    }
  };

  // Fetch user's posts
  const fetchUserPosts = async () => {
    if (!token) return setError("No token provided");

    setLoading(true);
    try {
      const res = await axios.get(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/posts/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching user posts:", err);
      setError("Failed to fetch posts (Unauthorized?)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchUserPosts();
  }, [token]);

  if (!token) return <p className="text-red-500">No token found. Please login.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {user ? `${user.name}'s Posts` : "My Posts"}
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Loading your posts...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">You haven't posted anything yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.postId}
              className="bg-white p-4 rounded-xl shadow-sm cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => navigate(`/posts/${post.postId}`)}
            >
              <h3 className="font-semibold text-gray-800">{post.title}</h3>
              <p className="text-gray-600 mt-1">
                {post.content.substring(0, 100)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserPosts;
