// Add "use client" at the top to make this a Client Component
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";  // Import from next/navigation in Next.js 13+
import Link from "next/link";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();  // Now works with next/navigation

  // Regular login (Username + Password)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/api/login", {
        username,
        password,
      });
      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);  // Store token in localStorage
        router.push("/dashboard");  // Redirect to Dashboard
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  // Google Login - Trigger Google authentication flow
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/api/auth/google";  // Redirect to Google login
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");
  
    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
  
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-customGrey p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Login</h2>
        {error && <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>}

        {/* Regular login form */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-black dark:text-white" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-white text-black dark:text-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-black dark:text-white" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-gray-50 dark:bg-white text-black dark:text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Login
          </button>
        </form>

        {/* Google login button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 text-black p-2 rounded-full mt-4 flex items-center justify-center shadow-sm hover:shadow-md"
        >
          <img
            src="assets/icons/google-image.png"
            alt="Google Logo"
            className="w-9 h-7 mr-2"
          />
          Continue with Google
        </button>

        <Link href="/register" className="text-blue-500 dark:text-blue-300 hover:underline mt-4 inline-block">
          Register here
        </Link>
      </div>
    </div>
  );
};

export default Login;
