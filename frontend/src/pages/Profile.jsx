import React, { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const token = localStorage.getItem("token");

  // Fetch user profile
  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/auth/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data); // backend returns signed GET URL for profileImage
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  // Handle profile image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      const ext = file.name.split(".").pop();

      // 1️⃣ Get signed PUT URL & key from backend
      const { data: uploadData } = await axios.get(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/auth/profile/upload-url",
        { headers: { Authorization: `Bearer ${token}` }, params: { ext } }
      );

      // 2️⃣ Upload file to S3
      await axios.put(uploadData.uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      // 3️⃣ Save S3 key in user profile
      await axios.put(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/auth/me",
        { profileImage: uploadData.key },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4️⃣ Refetch user to get signed GET URL
      await fetchUser();
    } catch (err) {
      console.error("Error uploading profile image:", err);
      alert("Failed to upload profile image.");
    } finally {
      setUploading(false);
    }
  };

  // Handle name change
  const handleNameChange = async () => {
    if (!newName.trim()) return;
    try {
      await axios.put(
        "https://g6ihp05rd9.execute-api.ca-central-1.amazonaws.com/auth/me",
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingName(false);
      setNewName("");
      await fetchUser();
    } catch (err) {
      console.error("Error updating name:", err);
    }
  };

  if (loading) return <p className="p-6">Loading profile...</p>;

  const getInitial = (name) => name?.charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow-md mb-8 flex flex-col items-center space-y-4">
        {/* Profile Avatar */}
        {user.profileImage ? (
          <img
            src={user.profileImage} // backend returns signed GET URL
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold">
            {getInitial(user.name)}
          </div>
        )}

        {/* Upload button */}
        <label className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600">
          {uploading ? "Uploading..." : "Add / Change Profile Picture"}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={uploading}
          />
        </label>

        {/* User Info */}
        <div className="flex flex-col items-center space-y-2">
          {editingName ? (
            <div className="flex space-x-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <button
                onClick={handleNameChange}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => { setEditingName(false); setNewName(""); }}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <p><strong>Name:</strong> {user.name}</p>
              <button
                onClick={() => setEditingName(true)}
                className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
              >
                Edit
              </button>
            </div>
          )}
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
