"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const dropdownRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

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

  const handleStartChatting = () => {
    setIsChatting(true);
    if (user) {
      const userName = user.user_metadata?.full_name || user.email.split('@')[0];
      const welcomeMessage = { text: `Hi ${userName}, how are you feeling today? 😊`, sender: "bot" };
      setMessages([welcomeMessage]);
    }
  };
  

  const handleSendMessage = async () => {
    if (input.trim() === "") return;
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const chatResponse = await fakeChatGPTResponse(input);
    const botMessage = { text: chatResponse, sender: "bot" };
    setMessages((prev) => [...prev, botMessage]);
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fakeChatGPTResponse = async (message) => {
    return `You said: ${message}. Here's a calm suggestion: Take a deep breath and relax.`;
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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

        {!isChatting ? (
          <Button 
            onClick={handleStartChatting} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
          >
            Start chatting
          </Button>
        ) : (
          <div className="w-full h-80 overflow-y-auto p-4 bg-white/20 rounded-lg" ref={chatContainerRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>
        )}
        {isChatting && (
          <div className="mt-4 flex gap-3">
            <input 
              type="text" 
              className="flex-1 p-2 rounded-lg" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <Button onClick={handleSendMessage} className="bg-blue-500 rounded-r-lg">Send</Button>
          </div>
        )}
      </div>
    </div>
  );
}
