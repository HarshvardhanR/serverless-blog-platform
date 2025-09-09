import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";

function CommentSection({ postId, comments, setComments }) {
  const [commentText, setCommentText] =
  useState("");
  const [postingComment, setPostingComment] = useState(false);
  const token = localStorage.getItem("token");

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

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
      alert("Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
        <span>Comments</span> ({comments.length})
      </h3>

      <form onSubmit={handleCommentSubmit} className="mb-4">
        <textarea
          placeholder="Write your comment in Markdown..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full p-2 border rounded-lg mb-2 min-h-[80px]"
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
            <div key={c.commentId} className="bg-gray-100 p-3 rounded-lg shadow-sm prose overflow-hidden">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{c.content}</ReactMarkdown>
              <p className="text-gray-500 text-xs mt-1">
                By {c.name} at {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentSection;
