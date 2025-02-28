import React, { useState, useEffect } from "react";
import {
  fetchChaptersByCourseId,
  fetchLessonsByChapterId,
} from "@/api/courses";
import { TableOfContentsChapters } from "@/types/course";
import Link from "next/link";

interface TableOfContentProps {
  course_id: string;
  selectedLesson_id: string | null;
}

function TableOfContent({ course_id, selectedLesson_id }: TableOfContentProps) {
  const [chapters, setChapters] = useState<TableOfContentsChapters[]>([]);

  const fetchChapters = async () => {
    const chapters = await fetchChaptersByCourseId(course_id);
    const chaptersWithLessons = await Promise.all(
      chapters.map(async (chapter) => {
        const lessons = await fetchLessonsByChapterId(chapter.id);
        return { ...chapter, lessons };
      })
    );
    setChapters(chaptersWithLessons);
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  return (
    <div className="p-5">
      <h2 className="font-opunbold text-2xl m-2">Table of Content</h2>
      <ul>
        {chapters.map((chapter) => (
          <li className="collapse collapse-arrow border border-black mb-2" key={chapter.id}>
            <input
              type="radio"
              name="collapse"
              id={`collapse-${chapter.id}`}
              defaultChecked={chapter.lessons.some(
                (lesson) => lesson.id === selectedLesson_id
              )}
            />
            <h3 className="font-opunsemibold bg-base-200 text-lg collapse-title">
              {chapter.title}
            </h3>
            <ul className="collapse-content p-2 flex flex-col gap-1 bg-base-200">
              {chapter.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className={`${
                    lesson.id == selectedLesson_id
                      ? "bg-stone-300 font-opunsemibold border border-black shadow-md"
                      : "bg-base-100 shadow-md"
                  } rounded-md px-5 py-2`}
                >
                  <Link
                    href={`/course/${course_id}/chapter/${chapter.id}/lesson/${lesson.id}`}
                  >
                    {lesson.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TableOfContent;
