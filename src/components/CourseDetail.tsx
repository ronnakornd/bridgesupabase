import React, { useEffect, useState, useCallback } from "react";
import { Course, TableOfContentsChapters } from "@/types/course";
import {
  fetchChaptersByCourseId,
  fetchLessonsByChapterId,
} from "@/api/courses";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, BadgeCheck, CheckCircle, Lock } from "lucide-react";
import { addToCart } from "@/api/cart";
import { useUser } from "@/components/UserContext";
import { redirectToCheckout } from "@/api/stripe";

interface CourseDetailProps {
  course: Course;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course }) => {
  const [chapters, setChapters] = useState<TableOfContentsChapters[]>([]);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user: profile, cart, reloadUser } = useUser();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const fetchChapters = useCallback(async () => {
    const chapters = await fetchChaptersByCourseId(course.id);
    const chaptersWithLessons = await Promise.all(
      chapters.map(async (chapter) => {
        const lessons = await fetchLessonsByChapterId(chapter.id);
        return { ...chapter, lessons };
      })
    );
    setChapters(chaptersWithLessons);

    if (chaptersWithLessons.length > 0) {
      setCompletedChapters([chaptersWithLessons[0].id]);

      const completedLessonIds: string[] = [];

      if (chaptersWithLessons[0]?.lessons) {
        chaptersWithLessons[0].lessons.forEach((lesson) => {
          completedLessonIds.push(lesson.id);
        });
      }

      if (
        chaptersWithLessons.length > 1 &&
        chaptersWithLessons[1]?.lessons?.length > 0
      ) {
        completedLessonIds.push(chaptersWithLessons[1].lessons[0].id);
      }

      setCompletedLessons(completedLessonIds);
    }
  }, [course.id]);

  const handleAddToCart = async (courseId: string) => {
    if (!profile) return;
    const { error } = await addToCart(courseId, profile.id);
    if (error) {
      console.error("Error adding to cart:", error);
    } else {
      setIsAddedToCart(true);
      await reloadUser();
    }
  };

  useEffect(() => {
    if (course) {
      if (profile) {
        if (course.student_id.includes(profile?.id)) {
          setIsEnrolled(true);
        }
        if (cart?.some((item) => item.id === course.id)) {
          setIsAddedToCart(true);
        }
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
      fetchChapters();
    }
  }, [course, fetchChapters, profile, cart]);

  const isChapterCompleted = (chapterId: string) => {
    return completedChapters.includes(chapterId);
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId);
  };

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

  if (!course) {
    return <div>Course not found</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="py-40 px-40 w-full flex flex-col justify-normal items-center min-h-screen">
      <div className="card bg-base-100 shadow-xl mb-4 w-3/4">
        <div className="card-body">
          <h1 className="card-title font-opunbold text-4xl">{course.title}</h1>
          <p className="text-base">{course.description}</p>
          <Image
            src={course.cover ?? ""}
            alt={course.title}
            width={1200}
            height={400}
            className="w-full h-48 object-cover rounded-md mb-3"
            priority
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
          {isEnrolled && (
            <div className=" badge bg-green-600 text-white p-3">
              <p>Enrolled</p>
            </div>
          )}

          <div className="card-actions justify-end">
            {!isEnrolled && isAddedToCart && (
              <button
                className="btn btn-success text-white"
                onClick={() =>
                  redirectToCheckout(
                    course.id,
                    profile?.id as string,
                    profile?.email as string
                  )
                }
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Checkout
              </button>
            )}
            {!isEnrolled && !isAddedToCart && (
              <button
                className="btn btn-neutral hover:bg-violet-950"
                onClick={() => handleAddToCart(course.id)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {isEnrolled && (
        <div className="w-3/4 mt-5 card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="text-2xl font-opunbold mb-2">Course Progress</h2>
            <progress
              className="progress progress-success w-full h-4"
              value={getOverallProgress()}
              max="100"
            ></progress>
            <div className="text-sm text-gray-500 mt-2">
              {completedLessons.length} of{" "}
              {chapters.reduce(
                (total, chapter) => total + chapter.lessons.length,
                0
              )}{" "}
              lessons completed ({getOverallProgress()}%)
            </div>
          </div>
        </div>
      )}

      <div className="w-3/4 mt-5 card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-2xl font-opunbold mb-2">Table of Contents</h2>
          <div className="menu menu-accordion">
            {chapters.map((chapter) => (
              <li
                key={chapter.id}
                className={`menu-content ${
                  isEnrolled && isChapterCompleted(chapter.id)
                    ? "border-l-4 border-success pl-2"
                    : ""
                }`}
              >
                <h1 className="menu-title caption-top font-opunbold capitalize flex items-center">
                  {isEnrolled && isChapterCompleted(chapter.id) && (
                    <CheckCircle className="h-5 w-5 mr-2 text-success" />
                  )}
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
                      {isEnrolled ? (
                        <Link
                          href={`/course/${course.id}/chapter/${chapter.id}/lesson/${lesson.id}`}
                          className="menu-link capitalize flex items-center"
                        >
                          {isLessonCompleted(lesson.id) && (
                            <CheckCircle className="h-4 w-4 mr-2 text-success" />
                          )}
                          <p className="w-full ">{lesson.title}</p>
                        </Link>
                      ) : (
                        <div className="menu-link capitalize flex items-center cursor-not-allowed text-gray-500  w-full p-1">
                          <Lock className="h-4 w-4  mr-2" />
                          <p className="w-full">{lesson.title}</p>
                        </div>
                      )}
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
