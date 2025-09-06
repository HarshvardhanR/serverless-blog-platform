import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function PostDetails() {
  const { postId } = useParams(); // get postId from URL
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [postingComment, setPostingComment] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchPostAndComments = async () => {
      try {
        // Fetch post details
        const postRes = await axios.get(
          `https://your-api-endpoint.com/posts/${postId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPost(postRes.data);

        // Fetch comments for this post
        const commentsRes = await axios.get(
          `https://your-api-endpoint.com/comments?postId=${postId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setComments(commentsRes.data);
      } catch (err) {
        console.error("Error fetching post or comments:", err);
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
        `https://your-api-endpoint.com/comments`,
        { postId, content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([res.data, ...comments]);
      setCommentText("");
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!post) return <p className="text-center mt-10">Post not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        &larr; Back
      </button>

      {/* Post */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <p className="text-gray-700">{post.content}</p>
        <p className="text-gray-400 text-sm mt-2">
          Posted at: {new Date(post.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Comments */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2"
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

        {/* Comments List */}
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div
                key={c.commentId}
                className="bg-gray-100 p-3 rounded-lg shadow-sm"
              >
                <p className="text-gray-800">{c.content}</p>
                <p className="text-gray-500 text-xs mt-1">
                  By {c.userId} at {new Date(c.createdAt).toLocaleString()}
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
