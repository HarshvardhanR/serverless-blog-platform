import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { UploadCloud, Eye } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function PostForm({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title.trim() || !content.trim()) {
      alert("Both title and content are required!");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        const uploadRes = await axios.post(
          `${API_BASE_URL}/posts/upload-url`,
          { fileName: imageFile.name, fileType: imageFile.type },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { uploadUrl, imageUrl: s3Key } = uploadRes.data;

        await axios.put(uploadUrl, imageFile, {
          headers: { "Content-Type": imageFile.type },
        });

        imageUrl = s3Key;
      }

      const postRes = await axios.post(
        `${API_BASE_URL}/posts`,
        { title, content, imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTitle("");
      setContent("");
      setImageFile(null);

      onPostCreated(postRes.data);
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-5xl mx-auto overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Eye className="w-6 h-6 text-blue-600" /> Create a Post
      </h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-xl mb-6 focus:ring-2 focus:ring-blue-400 outline-none text-gray-700"
        required
      />

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <textarea
          placeholder="Write your content in Markdown..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full md:w-1/2 p-4 border border-gray-300 rounded-xl min-h-[400px] focus:ring-2 focus:ring-blue-400 outline-none text-gray-700"
          required
        />

        <div className="w-full md:w-1/2 p-4 border border-gray-300 rounded-xl bg-gray-50 overflow-auto min-h-[400px]">
          <p className="text-gray-500 mb-2 font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-400" /> Live Preview:
          </p>

          <div className="prose max-w-full text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || "Nothing to preview yet..."}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 mb-6 cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-200 transition">
        <UploadCloud className="w-5 h-5" />
        {imageFile ? imageFile.name : "Upload Image"}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="hidden"
        />
      </label>

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? "Posting..." : "Post"}
      </motion.button>
    </motion.form>
  );
}

export default PostForm;
