"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setIsMounted(true); // Fix hydration error
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      // Check if the user already exists using Supabase Auth
      const { data: user, error: getUserError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (user) {
        setError("User already registered with this email.");
        setIsLoading(false);
        return;
      }
      if (getUserError && getUserError.message !== "Invalid login credentials") {
        throw getUserError;
      }

      // Proceed to sign up if user doesn't exist
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.name },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      setSuccess("Signup successful! Check your email for verification.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null; // Prevent hydration error

  return (
    <div
      style={{ backgroundImage: "url('/bg3.avif')" }}
      className="bg-cover bg-center h-screen flex items-center justify-center"
    >
      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-white text-center">Create Account</h2>
        <p className="text-white/80 text-center mt-1">Join us today!</p>

        {error && <p className="text-red-400 text-center mt-2">{error}</p>}
        {success && <p className="text-green-400 text-center mt-2">{success}</p>}

        <form className="mt-6" onSubmit={handleSignup}>
          <div>
            <label className="text-white block mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 rounded-md bg-white/20 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="mt-4">
            <label className="text-white block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 rounded-md bg-white/20 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="mt-4">
            <label className="text-white block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 rounded-md bg-white/20 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="mt-4">
            <label className="text-white block mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-2 rounded-md bg-white/20 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-white text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
