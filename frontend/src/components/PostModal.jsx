import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, Send, MessageSquare } from "lucide-react";
import axios from "axios";

function PostModal({ post, onClose }) {
  const token = localStorage.getItem("token");
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/post/${post.postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data);
    } catch (err) {
      console.error(err);
      setComments([]);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText) return;
    setPostingComment(true);

    try {
      const res = await axios.post(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/comments",
        { postId: post.postId, content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([res.data, ...comments]);
      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start p-6 overflow-auto z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-8 pt-12 relative overflow-hidden"
        >
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10"
          >
            <X size={24} />
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
            className="bg-white p-6 rounded-xl shadow-lg mb-6"
          >
            <h2 className="text-3xl font-bold mb-3 text-gray-800">{post.title}</h2>

            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full max-h-96 object-cover mb-4 rounded-lg shadow-lg"
              />
            )}

            <div className="prose max-w-none text-gray-700 mb-4">
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
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
              <MessageSquare size={20} /> Comments
            </h3>

            
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                placeholder="Write your comment in Markdown..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-400 min-h-[90px]"
                rows={3}
                required
              />
              <button
                type="submit"
                disabled={postingComment}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                {postingComment ? (
                  "Posting..."
                ) : (
                  <>
                    <Send size={16} /> Post Comment
                  </>
                )}
              </button>
            </form>

            {/* Comment List */}
            {comments.length === 0 ? (
              <p className="text-gray-500 italic">No comments yet. Be the first!</p>
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
                    className="bg-gray-50 p-4 rounded-lg shadow-sm border"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{c.content}</ReactMarkdown>
                    <p className="text-gray-500 text-xs mt-2">
                      By <span className="font-medium">{c.name}</span> •{" "}
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PostModal;
