//login
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  if (!isClient) return null; // Prevent hydration error

  return (
    <div style={{ backgroundImage: "url('/bg3.avif')" }} className="bg-cover bg-center h-screen flex items-center justify-center">
      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-white text-center">Welcome Back</h2>
        <p className="text-white/80 text-center mt-1">Login to continue</p>
        {error && <p className="text-red-400 text-center mt-2">{error}</p>}
        <form className="mt-6" onSubmit={handleLogin}>
          <label className="text-white block mb-1">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 rounded-md bg-white/20 text-white" />

          <label className="text-white block mb-1 mt-4">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full p-2 rounded-md bg-white/20 text-white" />

          <button type="submit" className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition" disabled={isLoading}>{isLoading ? "Logging in..." : "Login"}</button>
        </form>
        <p className="text-white text-center mt-4">Don&apos;t have an account? <Link href="/signup" className="text-blue-400 hover:underline">Sign up</Link></p>
      </div>
    </div>
  );
}