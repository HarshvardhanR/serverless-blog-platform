import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PostForm from "../components/PostForm";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader, X, MessageCircle, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [posts, setPosts] = useState([]);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const [page, setPage] = useState(0);
  const POSTS_PER_PAGE = 5;
  const [hasMore, setHasMore] = useState(false);

  const token = localStorage.getItem("token");

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/auth/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      localStorage.removeItem("token");
      navigate("/");
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await axios.get(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/posts",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch comments count for each post
      const postsWithCount = await Promise.all(
        res.data.map(async (post) => {
          const commentsRes = await axios.get(
            `https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/comments/post/${post.postId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return { ...post, commentsCount: commentsRes.data.length };
        })
      );

      setPosts(postsWithCount);
      setDisplayedPosts(postsWithCount.slice(0, POSTS_PER_PAGE));
      setPage(0);
      setHasMore(postsWithCount.length > POSTS_PER_PAGE);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setErrorPosts("Failed to load posts.");
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/comments/post/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchUser();
    fetchPosts();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setDisplayedPosts([newPost, ...displayedPosts.slice(1)]);
    setShowPostForm(false);
  };

  const openPostModal = async (post) => {
    setSelectedPost(post);
    setCommentText("");
    await fetchComments(post.postId);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText) return;
    setPostingComment(true);
    try {
      const res = await axios.post(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/comments",
        { postId: selectedPost.postId, content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([res.data, ...comments]);
      setCommentText("");
      // Update comment count in feed
      setPosts(posts.map(p =>
        p.postId === selectedPost.postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      ));
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  const loadNextPage = () => {
    const nextPage = page + 1;
    const start = nextPage * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    setDisplayedPosts(posts.slice(start, end));
    setPage(nextPage);
    setHasMore(end < posts.length);
  };

  const loadPrevPage = () => {
    if (page === 0) return;
    const prevPage = page - 1;
    const start = prevPage * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    setDisplayedPosts(posts.slice(start, end));
    setPage(prevPage);
    setHasMore(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 relative">
        <h1 className="text-3xl font-bold text-gray-800">
          {loadingUser ? "Loading user..." : `Welcome, ${user?.name || "User"}!`}
        </h1>

        <div className="flex items-center space-x-4">
          <Link
            to="/my-posts"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} /> My Posts
          </Link>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Create Post */}
      <div className="mb-6">
        <button
          onClick={() => setShowPostForm(!showPostForm)}
          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus size={18} />
          {showPostForm ? "Cancel" : "Create Post"}
        </button>
      </div>

      <AnimatePresence>
        {showPostForm && (
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12"
          >
            <PostForm onPostCreated={handlePostCreated} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Feed */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Feed</h2>

        {loadingPosts && <p className="flex items-center gap-2"><Loader size={16} className="animate-spin"/> Loading posts...</p>}
        {errorPosts && <p className="text-red-500">{errorPosts}</p>}
        {!loadingPosts && displayedPosts.length === 0 && <p>No posts available.</p>}

        <div className="space-y-6">
          <AnimatePresence>
            {displayedPosts.map((post) => (
              <motion.div
                key={post.postId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full max-h-64 object-cover mb-4 rounded-lg"
                  />
                )}

                <div className="text-gray-700 mb-2 prose max-w-full overflow-hidden">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content.length > 200 ? post.content.slice(0, 200) + "..." : post.content}
                  </ReactMarkdown>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => openPostModal(post)}
                    className="flex items-center gap-1 text-blue-500 hover:underline"
                  >
                    <MessageCircle size={16} /> Read More
                  </button>
                  <p className="text-gray-400 text-sm flex gap-2 items-center">
                    {post.commentsCount} {post.commentsCount === 1 ? "comment" : "comments"} • {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div className="flex justify-between mt-6">
          <button
            onClick={loadPrevPage}
            disabled={page === 0}
            className={`flex items-center gap-1 px-6 py-3 rounded-lg text-white transition-colors ${
              page === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-900"
            }`}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <button
            onClick={loadNextPage}
            disabled={!hasMore}
            className={`flex items-center gap-1 px-6 py-3 rounded-lg text-white transition-colors ${
              !hasMore ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-900"
            }`}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Post Modal */}
      <AnimatePresence>
        {selectedPost && (
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
              className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 relative overflow-hidden"
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-2">{selectedPost.title}</h2>

              {selectedPost.imageUrl && (
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  className="w-full max-h-96 object-cover mb-4 rounded-lg"
                />
              )}

              <div className="text-gray-700 mb-4 prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedPost.content}
                </ReactMarkdown>
              </div>

              <p className="text-gray-400 text-sm mb-4">
                Posted at: {new Date(selectedPost.createdAt).toLocaleString()}
              </p>

              {/* Comments */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <MessageCircle size={18} /> Comments
                </h3>

                <form onSubmit={handleCommentSubmit} className="mb-4">
                  <textarea
                    placeholder="Write your comment in Markdown..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full p-2 border rounded-lg mb-2 min-h-[80px] overflow-hidden"
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
                        className="bg-gray-100 p-3 rounded-lg shadow-sm overflow-hidden"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;
