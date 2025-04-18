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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const videoRef = useRef(null);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.storage.from("avatars").download(`${user.id}/avatar`);
        if (data) {
          setAvatarUrl(URL.createObjectURL(data));
        }
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
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      
      // Draw the current video frame to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert the captured image to grayscale
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
  
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];     // Red
        const g = pixels[i + 1]; // Green
        const b = pixels[i + 2]; // Blue
        
        // Calculate grayscale value
        const gray = 0.3 * r + 0.59 * g + 0.11 * b;
  
        // Set all three RGB values to the grayscale value
        pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
      }
  
      // Put the modified image back onto the canvas
      ctx.putImageData(imageData, 0, 0);
  
      // Return the grayscale image as a data URL
      return canvas.toDataURL("image/jpeg");
    }
    return null;
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

  if (!isClient) return null;

  return (
    <div 
      style={{ backgroundImage: "url('/bg3.avif')" }}
      className="bg-cover bg-center min-h-screen flex flex-col items-center justify-center p-6 relative"
    >
      <h1 className="absolute top-8 text-5xl font-bold text-white">Soulwave</h1>

      <div className="absolute top-4 right-4 flex gap-3 items-center">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Profile" 
            className="w-12 h-12 rounded-full cursor-pointer" 
          />
        ) : (
          <div className="w-12 h-12 bg-gray-400 rounded-full cursor-pointer"></div>
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
          <div className="w-full h-80 overflow-y-auto p-4 bg-white/20 rounded-lg" ref={chatContainerRef}>
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
            />
            <Button onClick={handleSendMessage} className="bg-blue-500 rounded-r-lg">Send</Button>
          </div>
        )}
      </div>
    </div>
  );
}
