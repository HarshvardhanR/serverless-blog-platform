import React, { useState } from "react";
import PostCard from "./PostCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function PostFeed({ posts, onSelectPost }) {
  const POSTS_PER_PAGE = 5;
  const [page, setPage] = useState(0);

  const displayedPosts = posts.slice(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE);
  const hasMore = (page + 1) * POSTS_PER_PAGE < posts.length;

  const loadNextPage = () => setPage(page + 1);
  const loadPrevPage = () => setPage(page - 1);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Feed</h2>

      <div className="space-y-6">
        {displayedPosts.map((post) => (
          <motion.div
            key={post.postId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <PostCard post={post} onSelect={() => onSelectPost(post)} />
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={loadPrevPage}
          disabled={page === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-md transform transition-all ${
            page === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-gray-800 to-gray-900 hover:shadow-lg hover:-translate-y-0.5"
          }`}
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <button
          onClick={loadNextPage}
          disabled={!hasMore}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-md transform transition-all ${
            !hasMore
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-gray-800 to-gray-900 hover:shadow-lg hover:-translate-y-0.5"
          }`}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

export default PostFeed;
