"use client";
import React, { useState, useEffect, memo } from "react";
import { Lesson } from "@/types/course";
import { deleteLesson, updateLesson } from "@/api/courses";
import UploadVideo from "./video/Uploader";
import VideoEdit from "./video/Editor";
import AtttachmentEditor from "./AtttachmentEditor";

interface LessonManagerProps {
  selectedLesson: Lesson | null;
  course_id: string;
  fetchLessons: () => void;
}

const LessonEditor: React.FC<LessonManagerProps> = ({
  selectedLesson,
  fetchLessons,
  course_id,
}: LessonManagerProps) => {
  const [editLessonTitle, setEditLessonTitle] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);

  const handleEditLesson = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!selectedLesson) {
      console.error("No lesson selected");
      return;
    }
    const editedLesson = {
      title: editLessonTitle,
    };
    updateLesson(selectedLesson.id, editedLesson).then(() => {
      fetchLessons();
    });
  };



  useEffect(() => {
    if (selectedLesson) {
      setEditLessonTitle(selectedLesson.title);
      setVideoId(selectedLesson.video_id);
    }
  }, [selectedLesson]);

  if (!selectedLesson) {
    return (
      <div className="p-52 w-full text-center text-stone-400">
        Select a lesson to edit
      </div>
    );
  }

  return (
    <div className="p-10 w-full">
      <div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-2 font-semibold">Lesson Title</label>
            <input
              type="text"
              placeholder="Chapter Title"
              className="input input-bordered w-full"
              value={editLessonTitle}
              onChange={(e) => setEditLessonTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Video</label>
            {videoId && (
            <VideoEdit video_id={selectedLesson?.video_id??""} lesson={selectedLesson} fetchLessons={fetchLessons}/>
            )}
            {!videoId && (
            <UploadVideo lesson_id={selectedLesson?.id} course_id={course_id} fetchLessons={fetchLessons} />
            )}
          </div>
          <div>
           <AtttachmentEditor lesson_id={selectedLesson.id} />
          </div>
          <div className="modal-action">
            <button className="btn btn-neutral w-full capitalize" onClick={handleEditLesson}>
              submit
            </button>
          </div>
        </div>
      </div>

      <dialog id="delete_lesson_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          {selectedLesson && (
            <>
              <p className="py-4">
                Are you sure you want to delete the lesson &quot;
                {selectedLesson.title}&quot;?
              </p>
              <div className="modal-action">
                <button
                  className="btn btn-error"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteLesson(selectedLesson.id).then(() => {
                      fetchLessons();
                    });
                    (document.getElementById("delete_lesson_modal") as HTMLDialogElement)?.close();
                  }}
                >
                  Delete
                </button>
                <button
                  className="btn"
                  onClick={(e) => {
                    e.preventDefault();
                    (document.getElementById("delete_lesson_modal") as HTMLDialogElement)?.close();
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
};
export default memo(LessonEditor);
