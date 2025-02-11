"use client";
import React, { useState, useEffect, memo } from "react";
import { Chapter, Lesson } from "@/types/course";
import ReorderGroup from "./reorder/ReorderGroup";
import {
  addLesson,
  fetchLessonsByChapterId,
  deleteLesson,
  updateLesson,
} from "@/api/courses";

interface LessonManagerProps {
  selectedChapter: Chapter | null;
}

const LessonManager: React.FC<LessonManagerProps> = ({
  selectedChapter,
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  const chapterId = selectedChapter?.id;

  const fetchLessons = async () => {
    if (!chapterId) {
      return;
    }
    const chaptersData = await fetchLessonsByChapterId(chapterId as string);
    setLessons(chaptersData.sort((a, b) => a.index - b.index));
  };

  const handleReorder = (items: { id: string; content: React.ReactNode }[]) => {
    const reorderedLessons = items.map((item) => {
      return lessons.find((lesson) => lesson.id === item.id);
    });
    setLessons(
      reorderedLessons.filter(
        (lesson): lesson is Lesson => lesson !== undefined
      )
    );
    reorderedLessons.forEach((lesson, index) => {
      if (lesson) {
        updateLesson(lesson.id, { index });
      }
    });
  };

  const handleAddLesson = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    const newLesson: Omit<Lesson, "id"> = {
      title: newLessonTitle,
      chapter_id: chapterId as string,
      index: lessons.length,
      attachments: [],
      asset_id: null,
      playback_id: null,
    };

    addLesson(newLesson).then((data) => {
      setLessons([...lessons, data]);
      fetchLessons();
    });

    // Clear the input fields
    setNewLessonTitle("");
    (document.getElementById("add_lesson_modal") as HTMLDialogElement)?.close();
  };

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
    // Clear the input fields
    setEditLessonTitle("");
    (document.getElementById("edit_lesson_modal") as HTMLDialogElement)?.close();
  };

  const handleDeleteVideo = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    fetch("/api/mux/", {
      method: "DELETE",
      body: JSON.stringify({
        asset_id: selectedLesson?.asset_id,
      }),
    }).then(() => {
      if (selectedLesson) {
        updateLesson(selectedLesson.id, {
          asset_id: null,
          playback_id: null,
        }).then(() => {
          fetchLessons();
        });
      }
    });
    (document.getElementById("delete_video_modal") as HTMLDialogElement)?.close();
  };

  useEffect(() => {
    fetchLessons();
  }, [selectedChapter]);



  
  if (!selectedChapter) {
    return (
      <div className="p-52 bg-base-200">
        <p className="text-center text-stone-400">Select a chapter to view lessons</p>
      </div>
    );
  }
  return (
    <div className="p-5 bg-base-200">
      <div className="flex justify-center">
      <h2 className="text-lg font-opunsemibold mb-4">{selectedChapter?.title}</h2>
      </div>
      {lessons.length === 0 && (
        <p className="text-center text-gray-500">No lessons found</p>
      )}

      {lessons.length > 0 && (
        <ReorderGroup
          items={lessons.map((lesson) => ({
            id: lesson.id,
            content: (
              <div
                className={`p-2 rounded shadow-md w-full flex gap-2 justify-between items-center hover:bg-slate-200 hover:cursor-pointer ${
                  selectedLesson?.id === lesson.id ? "bg-slate-300" : "bg-stone-100"
                }`}
                onClick={() => {
                  setSelectedLesson(
                    selectedLesson?.id === lesson.id ? null : lesson
                  );
                  setEditLessonTitle(lesson.title);
                }}
              >
                <h3 className="text-base font-opun">{lesson.title}</h3>
                <div className="flex gap-2">
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedLesson(lesson);
                      setEditLessonTitle(lesson.title);
                      (document.getElementById("edit_lesson_modal") as HTMLDialogElement)?.showModal();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 hover:text-blue-600"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M5 19h1.425L16.2 9.225L14.775 7.8L5 17.575zm-2 2v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM19 6.4L17.6 5zm-3.525 2.125l-.7-.725L16.2 9.225z"
                      />
                    </svg>
                  </div>

                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedLesson(lesson);

                      (document
                        .getElementById("delete_lesson_modal") as HTMLDialogElement)
                        ?.showModal();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 hover:text-rose-600"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ),
          }))}
          setItems={handleReorder}
        />
      )}
      <button
        onClick={(e) => {
          e.preventDefault();
          (document.getElementById("add_lesson_modal") as HTMLDialogElement)?.showModal();
        }}
        className="btn btn-ghost w-full mt-5"
      >
       Add Lesson
      </button>

      <dialog id="add_lesson_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Add Chapter</h3>
          <div>
            <label className="block mb-2">Lesson Title</label>
            <input
              type="text"
              placeholder="Chapter Title"
              className="input input-bordered w-full"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
            />
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleAddLesson}>
              Add Lesson
            </button>
            <button
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                (document.getElementById("add_lesson_modal") as HTMLDialogElement)?.close();
              }}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>

      <dialog id="edit_lesson_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit Chapter</h3>
          <div>
            <label className="block mb-2">Chapter Title</label>
            <input
              type="text"
              placeholder="Chapter Title"
              className="input input-bordered w-full"
              value={editLessonTitle}
              onChange={(e) => setEditLessonTitle(e.target.value)}
            />
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleEditLesson}>
              submit
            </button>
            <button
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                (document.getElementById("edit_lesson_modal") as HTMLDialogElement)?.close();
              }}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>

      <dialog id="delete_lesson_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          {selectedLesson && (
            <>
              <p className="py-4">
                Are you sure you want to delete the lesson &quot;
                {selectedLesson.title} &quot;?
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

      <dialog id="delete_video_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          {selectedLesson && (
            <>
              <p className="py-4">
                Are you sure you want to delete the current video of &quot;
                {selectedLesson.title}&quot;?
              </p>
              <div className="modal-action">
                <button
                  className="btn btn-error"
                  onClick={(e) => {
                    handleDeleteVideo(e);
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
export default memo(LessonManager);
