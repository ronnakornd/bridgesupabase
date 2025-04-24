"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { login } from "@/app/login/action";
import { UserContext } from "@/components/UserContext";
//import { createClient } from "@/libs/supabase/client";
//import { useRouter } from "next/navigation";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { reloadUser } = useContext(UserContext);
  //const [error, setError] = useState("");
  //const router = useRouter();

  /*
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        throw error;
      }
      router.push("/profile");

  };
  */
  useEffect(() => {
    reloadUser();
  }, [reloadUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
        <h2 className="text-5xl font-opunbold  text-center">Login</h2>
        {/*{error && <p className="toast bg-error bottom-5 right-5 animate-bounce rounded-md">{error}</p>}*/}
        <form className="space-y-4">
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <button
            formAction={login}
            type="submit"
            className="btn btn-primary w-full"
          >
            Login
          </button>
          <div className="flex justify-between mt-4">
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
            <Link
              href="/forgot-password"
              className="text-blue-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
