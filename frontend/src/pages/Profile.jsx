import React, { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("token");

  
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  const getInitial = (name) => name?.charAt(0).toUpperCase() || "?";

  
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setPreviewImage(URL.createObjectURL(file)); 

    try {
      const ext = file.name.split(".").pop();

    
      const { data: uploadData } = await axios.get(
        `${API_BASE_URL}/auth/profile/upload-url`,
        { headers: { Authorization: `Bearer ${token}` }, params: { ext } }
      );

    
      await axios.put(uploadData.uploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      
      await axios.put(
        `${API_BASE_URL}/auth/me`,
        { profileImage: uploadData.key },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchUser();
      setPreviewImage(null);
    } catch (err) {
      console.error("❌ Error uploading profile image:", err);
      alert("Failed to upload profile image.");
      setPreviewImage(null);
    } finally {
      setUploading(false);
    }
  };

  
  const handleNameChange = async () => {
    if (!newName.trim()) return;
    try {
      await axios.put(
        `${API_BASE_URL}/auth/me`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingName(false);
      setNewName("");
      await fetchUser();
    } catch (err) {
      console.error("❌ Error updating name:", err);
      alert("Failed to update name.");
    }
  };

  if (loading)
    return <p className="p-6 text-gray-600 text-center">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center space-y-4">
        
        <div className="relative w-32 h-32">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile Preview"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
            />
          ) : user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold">
              {getInitial(user?.name)}
            </div>
          )}
        </div>

        
        <label className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg cursor-pointer hover:bg-green-600 transition text-sm sm:text-base">
          {uploading ? "Uploading..." : "Add / Change Profile Picture"}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={uploading}
          />
        </label>

        
        <div className="flex flex-col items-center space-y-2">
          {editingName ? (
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border px-3 py-1 rounded w-48 sm:w-auto"
                placeholder="Enter new name"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleNameChange}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNewName("");
                  }}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <p>
                <strong>Name:</strong> {user?.name}
              </p>
              <button
                onClick={() => setEditingName(true)}
                className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-sm"
              >
                Edit
              </button>
            </div>
          )}
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
