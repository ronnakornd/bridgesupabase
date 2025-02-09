import Image from "next/image";
import Hero from "../components/Hero";
import Navbar from "@/components/Navbar";
import Courses from "@/components/Courses";

export default function Home() {
  return (
    <div data-theme="cupcake">
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <Hero />
        <Courses />
      </main>
    </div>
  );
}
