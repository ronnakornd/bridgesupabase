"use client";

import { useState, useEffect} from "react";
import { User } from "@/types/user";
import { fetchProfile } from "@/api/users";
import { updateLesson } from "@/api/courses";

interface UploadVideoProps {
  lesson_id: string;
  course_id: string;
  fetchLessons: () => void;
}

export default function UploadVideo({
  lesson_id,
  course_id,
  fetchLessons,
}: UploadVideoProps) {
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("video", video);
    formData.append("lesson_id", lesson_id || "");
    formData.append("course_id", course_id || "");
    formData.append("user_id", user?.id || "");

    try {
      const response = await fetch("/api/videos", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const videoData = await response.json();
        const updatedLesson = {
          video_id: videoData.id,
        };
        if (lesson_id) {
          await updateLesson(lesson_id, updatedLesson);
          fetchLessons();
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getProfile = async () => {
      const profile = await fetchProfile();
      setUser(profile);
    };
    getProfile();
  }, []);

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
            className="w-full file-input file-input-bordered"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-outline w-full disabled:bg-blue-300"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
