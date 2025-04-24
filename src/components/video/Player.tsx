"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Video } from "@/types/video";
import { startProgress, updateProgress, fetchProgress } from "@/api/progress";
interface videoViewerProps {
  videoId: string;
  courseId: string;
  lessonId: string;
  userId: string;
}

export default function VideoViewer({
  videoId,
  courseId,
  lessonId,
  userId,
}: videoViewerProps) {
  const [video, setVideo] = useState<Video | null>(null);
  const [playhead, setPlayhead] = useState(0);
  const [completed, setCompleted] = useState(false);
  const playerRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!userId || !courseId || !lessonId || !videoId) return;

    const fetchVideo = async () => {
      const response = await fetch(`/api/videos/${videoId}`);
      const data = await response.json();
      console.log(data);
      setVideo(data);
    };

    fetchVideo();

    const initializeProgress = async () => {
      let progress = await fetchProgress(courseId, userId, lessonId);
      if (!progress) {
        progress = await startProgress(courseId, userId, lessonId);
      }

      if (progress) {
        setPlayhead(progress.playhead);
        setCompleted(progress.completed);
      }
    };

    initializeProgress();
  }, [userId, courseId, lessonId, videoId]);


  useEffect(() => {
    if (!playerRef.current) return;
    playerRef.current.currentTime = playhead;
    if (completed) {
        playerRef.current.pause();
    }
}, [playhead, completed]);

useEffect(() => {
  if (!userId || !courseId || !lessonId || completed) return;

  const progressUpdateInterval = setInterval(async () => {
      if (playerRef.current) {
          const currentTime = playerRef.current.currentTime;
          setPlayhead(currentTime);
          await updateProgress({
              course_id: courseId,
              user_id: userId,
              lesson_id: lessonId,
              playhead: currentTime,
              completed: false
          });
      }
  }, 10000); // Update every 10 seconds

  const handleVideoEnded = async () => {
      setCompleted(true);
      await updateProgress({
          course_id: courseId,
          user_id: userId,
          lesson_id: lessonId,
          playhead: playerRef.current ? playerRef.current.duration : 0,
          completed: true
      });
      router.push(`/course/${courseId}`); // Redirect to course page or next lesson
  };

  // Capture the ref value in a variable
  const videoElement = playerRef.current;
  
  if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnded);
  }

  return () => {
      clearInterval(progressUpdateInterval);
      if (videoElement) {
          videoElement.removeEventListener('ended', handleVideoEnded);
      }
  };
}, [userId, courseId, lessonId, completed, router]);




  if (!video) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <video ref={playerRef} src={video.url} className="w-full mb-4" controls />
      {completed && <p>Lesson Completed!</p>}
    </div>
  );
}
