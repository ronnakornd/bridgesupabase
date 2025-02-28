"use client";

import { useState, useEffect } from "react";
import { Video } from "@/types/video";
interface videoViewerProps {
  video_id: string;
}

export default function VideoViewer({ video_id}: videoViewerProps) {
  const [video, setVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (!video_id) return;
    fetchVideo();
  }, []);

  const fetchVideo = async () => {
    const response = await fetch(`/api/videos/${video_id}`);
    const data = await response.json();
    setVideo(data);
  };


  if (!video) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <video src={video.url} className="w-full mb-4" controls/>
    </div>
  );
}
