import React, { useState } from "react";
import PostCard from "./PostCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function PostFeed({ posts, onSelectPost }) {
  const POSTS_PER_PAGE = 6;
  const [page, setPage] = useState(0);

  const displayedPosts = posts.slice(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE);
  const hasMore = (page + 1) * POSTS_PER_PAGE < posts.length;

  const loadNextPage = () => setPage(page + 1);
  const loadPrevPage = () => setPage(page - 1);

  return (
    <section className="w-full px-2 sm:px-4 lg:px-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center sm:text-left">Feed</h2>

      
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
  {displayedPosts.map((post) => (
    <motion.div
      key={post.postId}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-6 break-inside-avoid"
    >
      <PostCard post={post} onSelect={() => onSelectPost(post)} />
    </motion.div>
  ))}
</div>


      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-2 sm:gap-0">
        <button
          onClick={loadPrevPage}
          disabled={page === 0}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-md transform transition-all w-full sm:w-auto ${
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
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-md transform transition-all w-full sm:w-auto ${
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
