"use client";
import React, { useState, useEffect } from "react";
import CourseDetail from "@/components/CourseDetail";
import { Course } from "@/types/course";
import { useParams } from "next/navigation";
import { fetchCourseById } from "@/api/courses";

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchCourse = async () => {
    if (!id) {
      return;
    }
    const data = await fetchCourseById(id as string);
    setCourse(data);
    setIsLoaded(true);
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  return (
    <div className="px-10 min-h-screen w-full flex flex-col items-center justify-center">
      {!isLoaded && <div>Loading...</div>}
      {isLoaded && course && <CourseDetail course={course} />}
      {isLoaded && !course && <div>Course not found</div>}
    </div>
  );
}
