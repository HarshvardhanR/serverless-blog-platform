import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageCircle } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function PostCard({ post, onSelect }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      whileHover={{ y: -5, scale: 1.02, boxShadow: "0 15px 25px rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white p-4 sm:p-6 rounded-xl shadow-md overflow-hidden transition-shadow duration-300 w-full max-w-md mx-auto sm:mx-0"
    >
      <h3 className="text-lg sm:text-xl font-semibold mb-2 truncate">{post.title}</h3>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full max-h-64 object-cover mb-4 rounded-lg"
        />
      )}
      <div className="text-gray-700 mb-2 prose max-w-full overflow-hidden break-words">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content.length > 200 ? post.content.slice(0, 200) + "..." : post.content}
        </ReactMarkdown>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-2 sm:gap-0">
        <button
          onClick={onSelect}
          className="flex items-center gap-1 text-blue-500 hover:underline"
        >
          <MessageCircle size={16} /> Read More
        </button>
        <p className="text-gray-400 text-sm flex gap-2 items-center break-words">
          {post.commentsCount} {post.commentsCount === 1 ? "comment" : "comments"} •{" "}
          {new Date(post.createdAt).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

export default PostCard;
