"use client";
import React, { useState } from "react";
import { Course } from "@/types/course";

interface CourseGalleryProps {
  courses: Course[];
}

const CourseGallery: React.FC<CourseGalleryProps> = ({ courses }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<
    "all" | "beginner" | "intermediate" | "advanced"
  >("all");
  const [filterSubject, setFilterSubject] = useState<
    "all" | "math" | "science" | "language" | "social" | "coding" | "other"
  >("all");

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "all" || course.level === filterLevel;
    const matchesSubject =
      filterSubject === "all" || course.subject === filterSubject;

    return matchesSearch && matchesLevel && matchesSubject;
  });

  return (
    <div className="p-4">
      <div className="flex flex-col  justify-between mb-4">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered input-lg w-12/12  mb-4 lg:mb-0"
        />
        <div className="mt-2 w-full flex justify-end items-center gap-2">
          <select
            value={filterLevel}
            onChange={(e) =>
              setFilterLevel(
                e.target.value as
                  | "all"
                  | "beginner"
                  | "intermediate"
                  | "advanced"
              )
            }
            className="select select-sm select-bordered w-full max-w-xs mb-4 lg:mb-0"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            value={filterSubject}
            onChange={(e) =>
              setFilterSubject(
                e.target.value as
                  | "all"
                  | "math"
                  | "science"
                  | "language"
                  | "social"
                  | "coding"
                  | "other"
              )
            }
            className="select select-sm select-bordered w-full max-w-xs mb-4 lg:mb-0"
          >
            <option value="all">All Subjects</option>
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="language">Language</option>
            <option value="social">Social</option>
            <option value="coding">Coding</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-[80vw] pb-10">
        {filteredCourses.map((course) => (
          <div key={course.id} className="card bg-base-100 shadow-xl">
            <figure>
              <img src={course.cover ?? ""} alt={course.title} className="w-full object-cover" style={{height: '200px'}}/>
            </figure>
            <div className="card-body">
              <h2 className="card-title font-opunsemibold" style={{height: '20px'}}>{course.title}</h2>
                <div className="overflow-y-auto " style={{height: '100px'}}>
                {course.description.length > 100
                  ? `${course.description.substring(0, 100)}...`
                  : course.description}
                </div>
              <p style={{height: '20px'}}>
                <strong>Instructor:</strong> {course.instructor}
              </p>
              <p style={{height: '20px'}}>
                <strong>Price:</strong> {course.price} บาท
              </p>
              <div className="flex gap-1" style={{height: '20px'}}>
                {course.tags.map((tag) => (
                  <span key={tag} className="badge badge-neutral">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="card-actions justify-end">
                <a href={`/course/${course.id}`} className="btn btn-secondary">View</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseGallery;
