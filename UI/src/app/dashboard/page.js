"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emotion, setEmotion] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.storage.from('avatars').download(`${user.id}/avatar`);
        if (data) {
          setAvatarUrl(URL.createObjectURL(data));
        }
      }
    };
    fetchUser();
  }, []);

  const handleAnalyzeEmotion = async () => {
    setIsAnalyzing(true);
    setRecommendation("");

    setTimeout(async () => {
      const detectedEmotion = "Stressed";
      setEmotion(detectedEmotion);
      const chatResponse = await fakeChatGPTResponse(detectedEmotion);
      setRecommendation(chatResponse);
      setIsAnalyzing(false);
    }, 3000);
  };

  const fakeChatGPTResponse = async (emotion) => {
    return `Based on your detected emotion (${emotion}), try listening to calm music or meditating.`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isClient) return null;

  return (
    <div 
      style={{ backgroundImage: "url('/bg3.avif')" }}
      className="bg-cover bg-center min-h-screen flex flex-col items-center justify-center p-6 relative"
    >
      {/* Title */}
      <h1 className="absolute top-8 text-5xl font-bold text-white">Soulwave</h1>

      {/* Profile Picture and Dropdown */}
      <div className="absolute top-4 right-4 flex gap-3 items-center">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Profile" 
            className="w-12 h-12 rounded-full cursor-pointer" 
            onClick={toggleDropdown} 
          />
        ) : (
          <div className="w-12 h-12 bg-gray-400 rounded-full cursor-pointer" onClick={toggleDropdown}></div>
        )}
        {showDropdown && (
          <div ref={dropdownRef} className="absolute top-14 right-0 w-32 bg-white rounded-lg shadow-lg">
            <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</Link>
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100">Logout</button>
          </div>
        )}
      </div>

      {/* Container */}
      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-white text-center">Emotion Detection Dashboard</h1>
        
        <div className="w-full h-60 bg-white/20 flex items-center justify-center mb-6 rounded-lg">
          <span className="text-white/80">[ Video Feed Here ]</span>
        </div>

        <Button 
          onClick={handleAnalyzeEmotion} 
          disabled={isAnalyzing}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
        >
          {isAnalyzing ? "Analyzing..." : "Start chatting"}
        </Button>

        {isAnalyzing && <p className="mt-2 text-white/80 text-center">Thinking...</p>}
        
        {emotion && (
          <p className="mt-4 text-lg text-white text-center">
            Detected Emotion: <strong>{emotion}</strong>
          </p>
        )}
        
        {recommendation && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
            <p className="text-white/80">ChatGPT Recommendation:</p>
            <p className="text-blue-400 font-semibold">{recommendation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
