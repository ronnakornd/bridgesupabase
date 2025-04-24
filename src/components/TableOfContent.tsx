import React, { useState, useEffect } from "react";
import {
  fetchChaptersByCourseId,
  fetchLessonsByChapterId,
} from "@/api/courses";
import { TableOfContentsChapters } from "@/types/course";
import Link from "next/link";
import { CheckCircle} from "lucide-react";
import { fetchUserProgressByCourseId } from "@/api/progress";
import { createClient } from "@/libs/supabase/client";

interface TableOfContentProps {
  course_id: string;
  selectedLesson_id: string | null;
}

function TableOfContent({ course_id, selectedLesson_id }: TableOfContentProps) {
  const [chapters, setChapters] = useState<TableOfContentsChapters[]>([]);
  // Mock completed chapters for the demo - in real app, fetch this from user progress
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  // Mock completed lessons
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const fetchChapters = async () => {
    const chapters = await fetchChaptersByCourseId(course_id);
    const chaptersWithLessons = await Promise.all(
      chapters.map(async (chapter) => {
        const lessons = await fetchLessonsByChapterId(chapter.id);
        return { ...chapter, lessons };
      })
    );
    setChapters(chaptersWithLessons);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      const progress = await fetchUserProgressByCourseId(course_id, user.id);
      if (progress) {
        const completedChapters: string[] = [];
        const completedLessons: string[] = [];
        progress.forEach((item) => {
            if(item.completed === true){
                completedLessons.push(item.lesson_id);
            }
        });
        chaptersWithLessons.forEach((chapter) => {
           let chapterCompleted = false;
           chapter.lessons.forEach((lesson) => {
            if(completedLessons.includes(lesson.id)){
                chapterCompleted = true;
            }else{
                chapterCompleted = false;
            }
           });
           if(chapterCompleted){
            completedChapters.push(chapter.id);
           }
        });
        setCompletedChapters(completedChapters);
        setCompletedLessons(completedLessons);
      }
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const isChapterCompleted = (chapterId: string) => {
    return completedChapters.includes(chapterId);
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId);
  };


  // Calculate overall course progress percentage
  const getOverallProgress = () => {
    let totalLessons = 0;
    let completedCount = 0;

    chapters.forEach((chapter) => {
      totalLessons += chapter.lessons.length;
      completedCount += chapter.lessons.filter((lesson) =>
        isLessonCompleted(lesson.id)
      ).length;
    });

    if (totalLessons === 0) return 0;
    return Math.round((completedCount / totalLessons) * 100);
  };

  const overallProgress = getOverallProgress();

  return (
    <div className="p-5">
      <h2 className="font-opunbold text-2xl mb-4">Course Progress</h2>
      <progress
        className="progress progress-success w-full h-4"
        value={overallProgress}
        max="100"
      ></progress>
      <div className="text-sm text-gray-500 mt-2">
        {completedLessons.length} of{" "}
        {chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)}{" "}
        lessons completed ({overallProgress}%)
      </div>

      <hr className="my-4" />

      <h2 className="font-opunbold text-2xl my-4">Table of Content</h2>
      <ul>
        {chapters.map((chapter) => (
          <li
            className={`collapse collapse-arrow border mb-2 ${
              isChapterCompleted(chapter.id)
                ? "border-success bg-success bg-opacity-10"
                : "border-black"
            }`}
            key={chapter.id}
          >
            <input
              type="radio"
              name="collapse"
              id={`collapse-${chapter.id}`}
              defaultChecked={chapter.lessons.some(
                (lesson) => lesson.id === selectedLesson_id
              )}
            />
            <h3
              className={`font-opunsemibold text-lg collapse-title flex items-center justify-between ${
                isChapterCompleted(chapter.id) ? "text-success" : "bg-base-200"
              }`}
            >
              <div className="flex items-center">
                {isChapterCompleted(chapter.id) && (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                {chapter.title}
              </div>
            </h3>
            <ul className="collapse-content p-2 flex flex-col gap-1 bg-base-200">
              {chapter.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className={`${
                    lesson.id == selectedLesson_id
                      ? isLessonCompleted(lesson.id)
                        ? "bg-success bg-opacity-30 font-opunsemibold border border-success shadow-md"
                        : "bg-stone-300 font-opunsemibold border border-black shadow-md"
                      : isLessonCompleted(lesson.id)
                      ? "bg-success bg-opacity-10 shadow-md hover:bg-success hover:bg-opacity-20 cursor-pointer"
                      : "bg-base-100 shadow-md hover:bg-stone-200 cursor-pointer"
                  } rounded-md px-5 py-2 flex items-center justify-between`}
                  onClick={() => {
                    window.location.href = `/course/${course_id}/chapter/${chapter.id}/lesson/${lesson.id}`;
                  }}
                >
                  <Link
                    href={`/course/${course_id}/chapter/${chapter.id}/lesson/${lesson.id}`}
                    className="flex-grow"
                  >
                    {lesson.title}
                  </Link>
                  {isLessonCompleted(lesson.id) && (
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0 ml-2" />
                  )}
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
