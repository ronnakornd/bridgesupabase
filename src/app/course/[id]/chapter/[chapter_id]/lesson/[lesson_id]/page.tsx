"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Lesson } from "@/types/course";
import Breadcrump from "@/components/Breadcrump";
import { BreadCrumbItem } from "@/types/breadcrump";
import VideoViewer from "@/components/video/Player";
import {
  fetchLessonById,
  fetchCourseById,
  fetchChapterById,
} from "@/api/courses";
import AttachmentList from "@/components/AttachmentList";
import TableOfContent from "@/components/TableOfContent";
const LessonViewer: React.FC = () => {
  const { id, chapter_id, lesson_id } = useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [BreadCrumpItems, setBreadCrumpItems] = useState<BreadCrumbItem[]>([
    { name: "Course", href: `/course/${id}` },
    { name: "Chapter", href: `/course/${id}/chapter/${chapter_id}` },
    {
      name: "Lesson",
      href: `/course/${id}/chapter/${chapter_id}/lesson/${lesson_id}`,
    },
  ]);

  const fetchCourse = async () => {
    const fetchedCourse = await fetchCourseById(id as string);
    return fetchedCourse;
  };

  const fetchChapter = async () => {
    const fetchedChapter = await fetchChapterById(chapter_id as string);
    return fetchedChapter;
  };

  useEffect(() => {
    const getLesson = async () => {
      const fetchedLesson = await fetchLessonById(lesson_id as string);
      setLesson(fetchedLesson);
    };
    getLesson();
  }, [lesson_id]);

  useEffect(() => {
    fetchCourse().then((course) => {
      fetchChapter().then((chapter) => {
        if (course && chapter && lesson) {
          setBreadCrumpItems([
            { name: course.title, href: `/course/${id}` },
            {
              name: chapter.title,
              href: `/course/${id}/chapter/${chapter_id}`,
            },
            {
              name: lesson.title,
              href: `/course/${id}/chapter/${chapter_id}/lesson/${lesson_id}`,
            },
          ]);
        }
      });
    });
  }, [id, chapter_id, lesson]);

  return (
    <div className="grid grid-cols-12 gap-1">
      {lesson && (
        <div className="px-10 py-40 min-h-screen w-full flex flex-col items-start justify-start gap-4 col-span-8 ">
          <Breadcrump directory={BreadCrumpItems} />
          <div className="card bg-base-100 shadow-xl mb-4 w-full">
            <div className="card-body">
              <h1 className="card-title font-opunbold text-3xl">
                {lesson.title}
              </h1>
              {lesson.video_id && <VideoViewer video_id={lesson.video_id} />}
              {!lesson.video_id && (
                <div className="w-full max-w-3xl mb-4">
                  <p className="text-stone-400 text-sm">No video available</p>
                </div>
              )}
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl mb-4 w-full">
            <div className="card-body">
              <h2 className="card-title font-opunsemibold text-xl">
                Attachment
              </h2>
              {lesson_id && typeof lesson_id === "string" && (
                <AttachmentList lesson_id={lesson_id} />
              )}
            </div>
          </div>
        </div>
      )}
      <div className="pr-10 pt-10 col-span-4 mt-44">
        <div className="card bg-base-100 w-full sticky top-0 shadow-md">
          {id &&
            typeof id === "string" &&
            lesson_id &&
            typeof lesson_id === "string" && (
              <TableOfContent course_id={id} selectedLesson_id={lesson_id} />
            )}
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
