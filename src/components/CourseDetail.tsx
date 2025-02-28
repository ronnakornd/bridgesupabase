import React, { useEffect, useState } from "react";
import { Course, TableOfContentsChapters } from "@/types/course";
import {
  fetchChaptersByCourseId,
  fetchLessonsByChapterId,
} from "@/api/courses";
import Link from "next/link";

interface CourseDetailProps {
  course: Course;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course }) => {
  const [chapters, setChapters] = useState<TableOfContentsChapters[]>([]);

  const fetchChapters = async () => {
    const chapters = await fetchChaptersByCourseId(course.id);
    const chaptersWithLessons = await Promise.all(
      chapters.map(async (chapter) => {
        const lessons = await fetchLessonsByChapterId(chapter.id);
        return { ...chapter, lessons };
      })
    );
    setChapters(chaptersWithLessons);
  };

  useEffect(() => {
    if (course) {
      fetchChapters();
    }
  }, []);

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="py-40 px-40 w-full flex flex-col justify-normal items-center min-h-screen">
      <div className="card bg-base-100 shadow-xl mb-4 w-3/4">
        <div className="card-body">
          <h1 className="card-title font-opunbold text-4xl">{course.title}</h1>
          <p className="text-base">{course.description}</p>
          <img
            src={course.cover}
            alt={course.title}
            className="w-full h-48 object-cover rounded-md mb-3"
          />
          <p>
            <strong>Instructor: </strong>
            {course.instructor.map((instructor, index) => (
              <span key={course.instructor_id[index]}>{instructor}</span>
            ))}
          </p>
          <p>
            <strong>Duration:</strong> {course.duration} minutes
          </p>
          <p>
            <strong>Level:</strong> {course.level}
          </p>
          <p>
            <strong>Subject:</strong> {course.subject}
          </p>
          <p>
            <strong>Price:</strong> {course.price} บาท
          </p>
          <div className="card-actions justify-end">
            <button className="btn btn-neutral">Enroll</button>
          </div>
        </div>
      </div>
      <div className="w-3/4 mt-5 card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-2xl font-opunbold mb-2">Table of Contents</h2>
          <div className="menu menu-accordion">
            {chapters.map((chapter) => (
              <li key={chapter.id} className="menu-content">
                <h1 className="menu-title caption-top font-opunbold capitalize">
                  {chapter.title}
                </h1>
                <ul className="menu menu-nav">
                  {chapter.lessons.length == 0 && (
                    <li className="menu-item">
                      <a href="#" className="menu-link text-stone-400">
                        No lessons available
                      </a>
                    </li>
                  )}
                  {chapter.lessons.map((lesson) => (
                    <li key={lesson.id} className="menu-item mb-1">
                      <Link
                        href={`/course/${course.id}/chapter/${chapter.id}/lesson/${lesson.id}`}
                        className="menu-link capitalize "
                      >
                        {lesson.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
