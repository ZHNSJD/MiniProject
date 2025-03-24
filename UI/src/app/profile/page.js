"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ phone: "", bio: "", location: "" });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          router.push("/login");
        } else {
          setUser(user);
          const { data: profileData } = await supabase.from("profiles").select("phone, bio, location").eq("id", user.id).single();
          setProfile(profileData || { phone: "", bio: "", location: "" });
          const { data } = await supabase.storage.from('avatars').download(`${user.id}/avatar`);
          if (data) {
            setAvatarUrl(URL.createObjectURL(data));
          }
        }
      };
      fetchUser();
    }
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...profile });
    if (error) setError(error.message);
    else alert("Profile updated successfully!");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const filePath = `${user.id}/avatar`;
    const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (error) {
      setError(error.message);
    } else {
      const { data } = await supabase.storage.from('avatars').download(filePath);
      if (data) {
        setAvatarUrl(URL.createObjectURL(data));
      }
    }
    setUploading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handlePasswordChange = async () => {
    if (!password) return alert("Please enter a new password.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else alert("Password updated successfully!");
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div
      style={{ backgroundImage: "url('/bg3.avif')" }}
      className="bg-cover bg-center h-screen flex items-center justify-center"
    >
      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-white text-center">Profile</h2>
        {error && <p className="text-red-400 text-center">{error}</p>}

        <div className="text-white text-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-24 h-24 mx-auto rounded-full" />
          ) : (
            <div className="w-24 h-24 mx-auto rounded-full bg-gray-500" />
          )}
          <input type="file" accept="image/*" onChange={handleFileUpload} className="mt-4" />
          {uploading && <p>Uploading...</p>}
        </div>

        <div className="mt-4 text-white text-center">
          <p className="text-xl font-bold">{user?.user_metadata?.full_name || "N/A"}</p>
          <p className="text-xl font-bold">{user?.email}</p>
        </div>

        <div className="mt-4">
          <label className="text-white block mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-white/20 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <label className="text-white block mt-4 mb-1">Bio</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-white/20 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <label className="text-white block mt-4 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleChange}
            className="w-full p-2 rounded-md bg-white/20 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={handleUpdate}
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
          >
            Update Profile
          </button>

          <label className="text-white block mt-6 mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded-md bg-white/20 text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={handlePasswordChange}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 rounded-md transition"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
