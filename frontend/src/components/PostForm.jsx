import { useState } from "react";
import axios from "axios";

function PostForm({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/posts",
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTitle("");
      setContent("");
      onPostCreated(response.data); // update Dashboard posts
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg mx-auto"
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
      <textarea
        placeholder="Write your content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border rounded-lg mb-4"
        rows={4}
        required
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
