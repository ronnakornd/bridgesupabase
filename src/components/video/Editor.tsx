"use client";

import { useState, useEffect } from "react";
import { Video } from "@/types/video";
import { Lesson } from "@/types/course";
import { updateLesson } from "@/api/courses";

interface videoEditProps {
  video_id: string;
  lesson: Lesson;
  fetchLessons: () => void;
}

export default function VideoEdit({ video_id, lesson, fetchLessons }: videoEditProps) {
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

  const handleDeleteVideo = async () => {
    if (!video_id) return;
    const response = await fetch(`/api/videos/${video_id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      const updatedLesson = {
        ...lesson,
        video_id: null,
      };
      if (lesson?.id) {
        await updateLesson(lesson.id, updatedLesson);
        alert("Video deleted successfully");
        fetchLessons();
      }
    }
  };

  if (!video) return <div>Loading...</div>;

  return (
    <div className="">
      <video src={video.url} className="w-full max-w-3xl mb-4" controls />
      <button
        onClick={() => {
          (
            document.getElementById("delete_video_modal") as HTMLDialogElement
          )?.showModal();
        }}
        className="btn btn-error w-full"
      >
        Delete Video
      </button>

      <dialog id="delete_video_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          {lesson && (
            <>
              <p className="py-4">
                Are you sure you want to delete the current video of &quot;
                {lesson.title}&quot;?
              </p>
              <div className="modal-action">
                <button
                  className="btn btn-error"
                  onClick={() => {
                    handleDeleteVideo();
                  }}
                >
                  Delete
                </button>
                <button
                  className="btn"
                  onClick={(e) => {
                    e.preventDefault();
                    (
                      document.getElementById(
                        "delete_video_modal"
                      ) as HTMLDialogElement
                    )?.close();
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
