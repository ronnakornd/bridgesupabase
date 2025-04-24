"use client";
import React, { useEffect, useState } from "react";
import {
  fetchChaptersByCourseId,
  fetchLessonsByChapterId,
} from "@/api/courses";
import {Lesson, TableOfContentsChapters } from "@/types/course";
import LessonEditor from "./LessonEditor";

interface LessonContentProps {
  courseId: string;
  courseTitle: string;
  selectedLessonId: string | null;
}

function LessonContent({
  courseId,
  courseTitle,
  selectedLessonId,
}: LessonContentProps) {
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
    if (selectedLesson) {
      setSelectedLesson(
        chaptersWithLessons
          .flatMap((chapter) => chapter.lessons)
          .find((lesson) => lesson.id === selectedLesson.id) || null
      );
      alert("update successfully");
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("lesson", lesson.id);
    const newRelativePathQuery =
      window.location.pathname + "?" + searchParams.toString();
    window.history.pushState(null, "", newRelativePathQuery);
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  useEffect(() => {
    if (selectedLessonId && chapters.length > 0) {
      const lesson = chapters
        .flatMap((chapter) => chapter.lessons)
        .find((lesson) => lesson.id === selectedLessonId);
      setSelectedLesson(lesson || null);
    }
  }, [chapters, selectedLessonId]);

  return (
    <div className="grid grid-cols-3 gap-4 p-5 min-h-[70vh]">
      <div className="col-span-1">
        <h2 className="text-2xl font-opunbold m-5">{courseTitle}</h2>
        <ul className="menu bg-base-200 rounded-box w-full">
          {chapters.map((chapter) => (
            <li key={chapter.id} className="menu-title">
              <h1 className="font-opunsemibold capitalize h-auto flex flex-wrap">{chapter.title}</h1>
              {chapter.lessons.length == 0 && (
                <ul>
                  <li>
                    <a className="text-stone-400">No lessons available</a>
                  </li>
                </ul>
              )}
              {chapter.lessons && (
                <ul>
                  {chapter.lessons
                    .sort((a, b) => a.index - b.index)
                    .map((lesson) => (
                      <li key={lesson.id} >
                        <a
                          className={`whitespace-break-spaces border-b-2 text-xs border-b-stone-300 rounded-none ${
                            selectedLesson?.id == lesson.id
                              ? "bg-stone-300"
                              : ""
                          }`}
                          onClick={() => handleLessonSelect(lesson)}
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
        <LessonEditor
          selectedLesson={selectedLesson}
          fetchLessons={fetchChapters}
          course_id={courseId}
        />
      </div>
    </div>
  );
}

export default LessonContent;
