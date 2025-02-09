"use client";
import React, { useEffect, useState } from "react";
import {
  fetchCourseById,
  fetchChaptersByCourseId,
  fetchLessonsByChapterId,
} from "@/api/courses";
import { Chapter, Lesson } from "@/types/course";
import LessonEditor from "./LessonEditor";
import { li, ul } from "framer-motion/m";

interface LessonContentProps {
  courseId: string;
  courseTitle: string;
}

interface TableOfContentsChapters extends Chapter {
  lessons: Lesson[];
}

function LessonContent({ courseId, courseTitle }: LessonContentProps) {
  const [chapters, setChapters] = useState<TableOfContentsChapters[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const fetchChapters = async () => {
    const chapters = await fetchChaptersByCourseId(courseId);
    const chaptersWithLessons = await Promise.all(
      chapters.map(async (chapter) => {
        const lessons = await fetchLessonsByChapterId(chapter.id);
        return { ...chapter, lessons };
      })
    );
    setChapters(chaptersWithLessons);
    if(selectedLesson) {
      setSelectedLesson(chaptersWithLessons.flatMap(chapter => chapter.lessons).find(lesson => lesson.id === selectedLesson.id) || null);
      alert("update successfully");
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 p-5 min-h-[70vh]">
      <div className="col-span-1">
        <h2 className="text-3xl font-opunbold m-5">{courseTitle}</h2>
        <ul className="menu bg-base-200 rounded-box w-full">
          {chapters.map((chapter) => (
            <li key={chapter.id} className="menu-title">
              <h1 className="font-opunsemibold capitalize">{chapter.title}</h1>
              {chapter.lessons.length == 0 && (
                <ul>
                  <li>
                    <a className="text-stone-400">
                      No lessons available
                    </a>
                  </li>
                </ul>
              )}
              {chapter.lessons && (
                <ul>
                  {chapter.lessons
                  .sort((a, b) => a.index - b.index)
                  .map((lesson) => (
                    <li key={lesson.id}>
                    <a
                      className={`${
                      selectedLesson?.id == lesson.id ? "bg-stone-300" : ""
                      }`}
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      {lesson.title}
                    </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-2">
        <LessonEditor selectedLesson={selectedLesson} fetchLessons={fetchChapters} />
      </div>
    </div>
  );
}

export default LessonContent;
