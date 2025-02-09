"use client";
import React,{useEffect,useState} from "react";
import CourseGallery from "./CourseGallery";
import { Course } from "@/types/course";
import { fetchCourses } from "@/api/courses";

const Courses: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        const getCourses = async () => {
            try {
                const courses = await fetchCourses();
                setCourses(courses);
            } catch (error) {
                console.error(error);
            }
        };

        getCourses();
    }, []);

  return (
    <div className="px-10 w-full flex flex-col items-center justify-start bg-base-200">
      <h1 className="text-5xl font-opunbold mb-4">Courses</h1>
      <CourseGallery courses={courses} />
    </div>
  );
};

export default Courses;