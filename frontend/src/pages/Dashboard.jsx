import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostForm from "../components/PostForm";
import Header from "../components/Header";
import PostFeed from "../components/PostFeed";
import PostModal from "../components/PostModal";
import axios from "axios";
import { Plus, X } from "lucide-react"; 


function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);

  const token = localStorage.getItem("token");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // Fetch user
  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/");
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/posts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Add commentsCount
      const postsWithCount = await Promise.all(
        res.data.map(async (post) => {
          const commentsRes = await axios.get(
            `${API_BASE_URL}/post/${post.postId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return { ...post, commentsCount: commentsRes.data.length };
        })
      );
      setPosts(postsWithCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) navigate("/");
    fetchUser();
    fetchPosts();
  }, [token, navigate]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowPostForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-6 overflow-hidden">
      <Header user={user} loadingUser={loadingUser} />
      <div className="mb-6">
  <button
    onClick={() => setShowPostForm(!showPostForm)}
    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400"
  >
    {showPostForm ? <X size={18} /> : <Plus size={18} />}
    {showPostForm ? "Cancel" : "Create Post"}
  </button>
</div>
      {showPostForm && <PostForm onPostCreated={handlePostCreated} />}
      <PostFeed posts={posts} onSelectPost={setSelectedPost} />
      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  );
}

export default Dashboard;
