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
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const dropdownRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error);
          return;
        }
        if (user) {
          setUser(user);
          // Try to fetch the avatar after setting user
          fetchAvatar(user.id);
        }
      } catch (err) {
        console.error("Error in user fetch process:", err);
      }
    };
    fetchUser();

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  }, []);

  const fetchAvatar = async (userId) => {
    try {
      // Simple direct download attempt with proper error handling
      const { data, error } = await supabase
        .storage
        .from("avatars")
        .download(`${userId}/avatar`);
      
      if (error) {
        // This is expected for new users with no avatar
        console.log("No avatar found or error:", error.message);
        return;
      }
      
      if (data) {
        // Successfully downloaded avatar
        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
      }
    } catch (err) {
      console.error("Avatar fetch failed:", err);
    }
  };

  const handleStartChatting = () => {
    setIsChatting(true);
    if (user) {
      const userName = user.user_metadata?.full_name || user.email.split('@')[0];
      const welcomeMessage = { text: `Hi ${userName}, how are you feeling today? 😊`, sender: "bot" };
      setMessages([welcomeMessage]);
    }
  };

  const captureScreenshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Add checks for readiness
    if (!video || !canvas || video.readyState < video.HAVE_CURRENT_DATA) {
        console.error("Video or Canvas not ready for capture.");
        return null; // Return null if not ready
    }

    try {
      const ctx = canvas.getContext("2d", { willReadFrequently: true }); // Optimization hint
      if (!ctx) {
         console.error("Failed to get 2D context from canvas.");
         return null;
      }

      // Set canvas dimensions to video dimensions for accurate capture
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 1. Draw the current video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 2. Get the ImageData object
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data; // This is a Uint8ClampedArray: [R, G, B, A, R, G, B, A, ...]

      // 3. Iterate through each pixel and apply grayscale formula
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];     // Red
        const g = pixels[i + 1]; // Green
        const b = pixels[i + 2]; // Blue
        // Alpha (pixels[i + 3]) is ignored for calculation but preserved

        // Calculate grayscale value using the luminosity method (Rec. 709)
        // Formula: 0.2126 * R + 0.7152 * G + 0.0722 * B
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        // 4. Update the R, G, B values of the pixel to the grayscale value
        // The values are clamped automatically by the Uint8ClampedArray
        pixels[i] = gray;     // Red
        pixels[i + 1] = gray; // Green
        pixels[i + 2] = gray; // Blue
        // pixels[i + 3] remains the original alpha value (usually 255)
      }

      // 5. Put the modified ImageData back onto the canvas
      ctx.putImageData(imageData, 0, 0);

      // 6. Return the grayscale image as a data URL
      // Specify quality for JPEG to control size/performance if needed
      return canvas.toDataURL("image/jpeg", 0.9); // Quality 0.9 (adjust as needed)

    } catch (err) {
       console.error("Error during canvas drawing or grayscale conversion:", err);
       // Optionally display an error to the user or handle it further
       // setErrorMessage("Could not process image frame."); // If you have an error state
       return null; // Return null on error
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const screenshot = captureScreenshot();
    let detectedEmotion = "neutral";

    try {
      if (screenshot) {
        const blob = await (await fetch(screenshot)).blob();
        const imageFile = new File([blob], "screenshot.jpg", { type: "image/jpeg" });

        const formData = new FormData();
        formData.append("file", imageFile);

        const emotionResponse = await fetch("http://localhost:8000/detect_emotion/", {
          method: "POST",
          body: formData,
        });

        const emotionData = await emotionResponse.json();
        detectedEmotion = emotionData.detected_emotion || "neutral";
      }
    } catch (err) {
      console.error("Emotion detection failed:", err);
    }

    try {
      const chatResponse = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input, emotion: detectedEmotion }),
      });

      const chatData = await chatResponse.json();
      const botMessage = { text: chatData.bot_response, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Chat request failed:", err);
      setMessages((prev) => [...prev, { text: "Oops, something went wrong.", sender: "bot" }]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  }
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl]);
  
  if (!isClient) return null;

  return (
    <div 
      style={{ backgroundImage: "url('/bg3.avif')" }}
      className="bg-cover bg-center min-h-screen flex flex-col items-center justify-center p-6 relative"
    >
      <h1 className="absolute top-8 text-5xl font-bold text-white">Soulwave</h1>

      <div className="absolute top-4 right-4 flex gap-3 items-center z-10">
        <div 
          className="w-12 h-12 rounded-full cursor-pointer overflow-hidden border-2 border-white/50"
          onClick={toggleDropdown}
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        
        {showDropdown && (
          <div ref={dropdownRef} className="absolute top-14 right-0 w-40 bg-white/90 backdrop-blur-md rounded-lg shadow-lg py-2">
            <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition">
              Profile Settings
            </Link>
            <button 
              onClick={handleLogout} 
              className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-white text-center">Emotion Detection Dashboard</h1>
        
        <div className="w-full h-60 bg-white/20 flex items-center justify-center mb-6 rounded-lg">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full"></video>
        </div>

        <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }}></canvas>

        {!isChatting ? (
          <Button 
            onClick={handleStartChatting} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
          >
            Start chatting
          </Button>
        ) : (
          <div className="w-full h-80 overflow-y-auto p-4 bg-white/20 rounded-lg">
            {messages.map((msg, index) => (
              <div key={index} className={`my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                  {msg.text}
                </span>
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
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} className="bg-blue-500 rounded-r-lg">Send</Button>
          </div>
        )}
      </div>
    </div>
  );
}