"use client";
import React, { useState, useEffect, useCallback } from "react";
import CourseDetail from "@/components/CourseDetail";
import { Course } from "@/types/course";
import { useParams } from "next/navigation";
import { fetchCourseById } from "@/api/courses";

export default function CoursePage() {
  const params = useParams();
  const id = params?.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!id) {
      return;
    }
    const data = await fetchCourseById(id as string);
    setCourse(data);
    setIsLoaded(true);
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return (
    <div className="px-10 min-h-screen w-full flex flex-col items-center justify-center">
      {!isLoaded && <div>Loading...</div>}
      {isLoaded && course && <CourseDetail course={course} />}
      {isLoaded && !course && <div>Course not found</div>}
    </div>
  );
}
