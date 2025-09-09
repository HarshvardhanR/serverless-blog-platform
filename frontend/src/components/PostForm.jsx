import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function PostForm({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        const uploadRes = await axios.post(
          "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/posts/upload-url",
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
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/posts",
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
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-5xl mx-auto"
    >
      <h2 className="text-xl font-bold mb-4">Create a Post</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded-lg mb-4"
        required
      />

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <textarea
          placeholder="Write your content in Markdown..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full md:w-1/2 p-2 border rounded-lg min-h-[400px]"
        />

        <div className="w-full md:w-1/2 p-4 border rounded-lg bg-gray-50 overflow-auto min-h-[400px]">
          <p className="text-gray-500 mb-2 font-semibold">Live Preview:</p>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || "Nothing to preview yet..."}
          </ReactMarkdown>
        </div>
      </div>

      {/* Image upload */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}

export default PostForm;
