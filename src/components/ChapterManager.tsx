"use client";
import React, { useState, useEffect, memo } from "react";
import { Chapter } from "@/types/course";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "next/navigation";
import ReorderGroup from "./reorder/ReorderGroup";
import { supabase } from "@/libs/supabase/client";
import {
  addChapter,
  fetchChaptersByCourseId,
  updateChapter,
  deleteChapter,
  updateCourse,
} from "@/api/courses";

interface ChapterManagerProps {
  onSelectedChapter: (chapter: Chapter) => void;
}

const ChapterManager: React.FC<ChapterManagerProps> = ({
  onSelectedChapter,
}) => {
  const [chaptersIds, setChaptersIds] = useState<string[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const { id: courseId } = useParams();

  const fetchChapters = async () => {
    if (!courseId) {
      return;
    }
    const chaptersData = await fetchChaptersByCourseId(courseId as string);
    setChapters(chaptersData.sort((a, b) => a.index - b.index));
  };

  const handleReorder = (items: { id: string; content: React.ReactNode }[]) => {
    const reorderedChapters = items.map((item) => {
      return chapters.find((chapter) => chapter.id === item.id);
    });
    setChapters(
      reorderedChapters.filter(
        (chapter): chapter is Chapter => chapter !== undefined
      )
    );
    reorderedChapters.forEach((chapter, index) => {
      if (chapter) {
        updateChapter(chapter.id, { index });
      }
    });
  };

  const handleAddChapter = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    const newChapter: Omit<Chapter, "id"> = {
      title: newChapterTitle,
      course_id: courseId as string,
      index: chapters.length,
    };

    addChapter(newChapter).then((data) => {
      setChapters([...chapters, data]);
      fetchChapters();
    });

    // Clear the input fields
    setNewChapterTitle("");
    document.getElementById("add_chapter_modal")?.close();
  };

  const handleEditChapter = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    if (!selectedChapter) {
      return;
    }

    updateChapter(selectedChapter.id, {
      title: editChapterTitle,
    }).then(() => {
      fetchChapters();
    });

    // Clear the input fields
    setEditChapterTitle("");
    document.getElementById("edit_chapter_modal")?.close();
  };

  useEffect(() => {
    fetchChapters();
  }, [courseId]);

  useEffect(() => {
    if (selectedChapter) {
      onSelectedChapter(selectedChapter);
    }
  }, [selectedChapter]);

  return (
    <div className="bg-stone-200 p-5">
      <h2 className="text-xl font-bold pl-5 mb-4">Chapters</h2>
      <ReorderGroup
        items={chapters.map((chapter) => ({
          id: chapter.id,
          content: (
            <div
              className={`p-2 rounded shadow-md w-full flex gap-2 justify-between items-center hover:bg-slate-200 hover:cursor-pointer ${
                selectedChapter?.id === chapter.id ? "bg-slate-300" : "bg-white"
              }`}
              onClick={() => {
                setSelectedChapter(chapter);
                setEditChapterTitle(chapter.title);
              }}
            >
              <h3 className="text-base font-opun">{chapter.title}</h3>
              <div className="flex gap-2">
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedChapter(chapter);
                    setEditChapterTitle(chapter.title);
                    document.getElementById("edit_chapter_modal")?.showModal();
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
                    e.stopPropagation();
                    setSelectedChapter(chapter);
                    document
                      .getElementById("delete_chapter_modal")
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
      <button
        onClick={(e) => {
          e.preventDefault();

          document.getElementById("add_chapter_modal")?.showModal();
        }}
        className="btn btn-ghost w-full mt-5"
      >
        Add Chapter
      </button>

      <dialog id="add_chapter_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Add Chapter</h3>
          <div>
            <label className="block mb-2">Chapter Title</label>
            <input
              type="text"
              placeholder="Chapter Title"
              className="input input-bordered w-full"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
            />
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleAddChapter}>
              Add Chapter
            </button>
            <button
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("add_chapter_modal")?.close();
              }}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>

      <dialog id="edit_chapter_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit Chapter</h3>
          <div>
            <label className="block mb-2">Chapter Title</label>
            <input
              type="text"
              placeholder="Chapter Title"
              className="input input-bordered w-full"
              value={editChapterTitle}
              onChange={(e) => setEditChapterTitle(e.target.value)}
            />
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleEditChapter}>
              submit
            </button>
            <button
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("edit_chapter_modal")?.close();
              }}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>

      <dialog id="delete_chapter_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          {selectedChapter && (
            <>
              <p className="py-4">
                Are you sure you want to delete the chapter "
                {selectedChapter.title}"?
              </p>
              <div className="modal-action">
                <button
                  className="btn btn-error"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteChapter(selectedChapter.id).then(() => {
                      fetchChapters();
                    });
                    document.getElementById("delete_chapter_modal")?.close();
                  }}
                >
                  Delete
                </button>
                <button
                  className="btn"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("delete_chapter_modal")?.close();
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
export default memo(ChapterManager);
