import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!post) return <p className="text-center mt-10">Post not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        &larr; Back
      </button>

      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full max-h-96 object-cover mb-4 rounded-lg"
          />
        )}

        <div className="text-gray-700 mb-2 prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        <p className="text-gray-400 text-sm mt-2">
          Posted at: {new Date(post.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>

        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            placeholder="Write your comment in Markdown..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2 min-h-[80px]"
            rows={3}
            required
          />
          <button
            type="submit"
            disabled={postingComment}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {postingComment ? "Posting..." : "Post Comment"}
          </button>
        </form>

        {comments.length === 0 ? (
  <p className="text-gray-500">No comments yet.</p>
) : (
  <div className="space-y-4">
    {comments.map((c) => (
      <div
        key={c.commentId}
        className="bg-gray-100 p-3 rounded-lg shadow-sm prose max-w-full"
      >
        
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {c.content}
        </ReactMarkdown>

        <p className="text-gray-500 text-xs mt-1">
          By {c.name} at {new Date(c.createdAt).toLocaleString()}
        </p>
      </div>
    ))}
  </div>
)}

      </div>
    </div>
  );
}

export default PostDetails;
