import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";

function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [postingComment, setPostingComment] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchPostAndComments = async () => {
      try {
        setLoading(true);
        setError(null);

        const [postRes, commentsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/posts/${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/comments/post/${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setPost(postRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        console.error("Error fetching post or comments:", err);
        setError("Failed to load post or comments.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [postId, navigate, token]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPostingComment(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/comments`,
        { postId, content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([res.data, ...comments]);
      setCommentText("");
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 animate-pulse text-gray-600">
        Loading...
      </p>
    );
  if (error)
    return (
      <p className="text-center mt-10 text-red-500 font-medium">{error}</p>
    );
  if (!post)
    return <p className="text-center mt-10 text-gray-600">Post not found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
      >
        <ArrowLeft size={18} /> Back
      </button>

      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          y: -5,
          scale: 1.01,
          boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">
          {post.title}
        </h1>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full max-h-96 object-cover mb-4 rounded-lg shadow-md"
          />
        )}

        <div className="prose max-w-full text-gray-700 mb-4 break-words">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        <p className="text-gray-400 text-sm">
          Posted at {new Date(post.createdAt).toLocaleString()}
        </p>
      </motion.div>

    
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg"
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
          <MessageSquare size={20} /> Comments
        </h2>

        
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            placeholder="Write your comment in Markdown..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-400 min-h-[90px] text-sm sm:text-base"
            rows={3}
            required
          />
          <button
            type="submit"
            disabled={postingComment}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm sm:text-base"
          >
            {postingComment ? "Posting..." : <> <Send size={16} /> Post Comment </>}
          </button>
        </form>

        
        {comments.length === 0 ? (
          <p className="text-gray-500 italic text-sm sm:text-base">
            No comments yet. Be the first!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <motion.div
                key={c.commentId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  y: -2,
                  scale: 1.01,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                }}
                transition={{ type: "spring", stiffness: 250, damping: 20 }}
                className="bg-gray-50 p-3 sm:p-4 rounded-lg shadow-sm border break-words"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {c.content}
                </ReactMarkdown>
                <p className="text-gray-500 text-xs sm:text-sm mt-2">
                  By <span className="font-medium">{c.name}</span> •{" "}
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default PostDetails;
