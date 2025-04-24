"use client";
import Hero from "../components/Hero";
import Courses from "@/components/Courses";
import { UserContext } from "@/components/UserContext";
import { useContext, useEffect } from "react";

export default function Home() {
  const { reloadUser } = useContext(UserContext);
  // This runs EVERY time the component mounts/updates after redirect
  useEffect(() => {
    reloadUser(); // This forces a reload, potentially redundant
  }, [reloadUser]);

  return (
    <div data-theme="cupcake">
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <Hero />
        <Courses />
      </main>
    </div>
  );
}
