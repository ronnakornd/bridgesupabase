import React from "react";
import CourseDetail from "@/components/CourseDetail";
import { Course } from "@/types/course";
import { fetchCourseById } from '@/api/courses';




export default async function CoursePage({
    params,
  }: {
    params: Promise<{ id: string }>
  }) {
    const id = (await params).id;
    const course = await fetchCourseById(id);
    if (!course) {
      return <div>Course not found</div>;
    }

    return (
        <div  className="px-10 w-full flex flex-col items-center justify-start">
          <CourseDetail course={course} />
        </div>
      );
  }
