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
          axios.get(
            `https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/posts/${postId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/comments/post/${postId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
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
    if (!commentText) return;
    setPostingComment(true);

    try {
      const res = await axios.post(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/comments",
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

  if (loading) return <p className="text-center mt-10 animate-pulse">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!post) return <p className="text-center mt-10">Post not found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-lg mb-8"
      >
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full max-h-96 object-cover mb-4 rounded-lg shadow"
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

      {/* Comments */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare size={20} /> Comments
        </h2>

        {/* Comment form */}
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
            {postingComment ? "Posting..." : <> <Send size={16} /> Post Comment </>}
          </button>
        </form>

        {/* Comment list */}
        {comments.length === 0 ? (
          <p className="text-gray-500 italic">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <motion.div
                key={c.commentId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 p-4 rounded-lg shadow-sm border"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {c.content}
                </ReactMarkdown>
                <p className="text-gray-500 text-xs mt-2">
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
