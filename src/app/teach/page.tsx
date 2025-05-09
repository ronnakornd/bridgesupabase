"use client";
import React, { useEffect, useState } from "react";
import { fetchCourseByinstructorId, deleteCourse } from "@/api/courses";
import { fetchProfile } from "@/api/users";
import { Course } from "@/types/course";
import BadgeLevel from "@/components/BadgeLevel";
import Link from "next/link";
import { User } from "@/types/user";
import { UsersRound } from "lucide-react";
import Pagination from "@/components/Pagination";
import { createProduct } from "@/api/stripe";

function Teach() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [filterLevel, setFilterLevel] = useState<
    "all" | "beginner" | "intermediate" | "advanced"
  >("all");
  const [filterSubject, setFilterSubject] = useState<
    "all" | "math" | "science" | "language" | "social" | "coding" | "other"
  >("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 3;

  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteCourse(id);
      setCourses(courses.filter((course) => course.id !== id));
      setSelectedCourse(null);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      const data = await fetchProfile();
      if (data) {
        setUser(data);
      }
    };
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchCoursesData = async () => {
        const data = await fetchCourseByinstructorId(user.id);
        if (data) {
          setCourses(data);
          setIsLoaded(true);
        }
      };
      fetchCoursesData();
    }
  }, [user]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "all" || course.level === filterLevel;
    const matchesSubject =
      filterSubject === "all" || course.subject === filterSubject;

    return matchesSearch && matchesLevel && matchesSubject;
  });

  useEffect(() => {
    setTotalPages(Math.ceil(filteredCourses.length / itemsPerPage));
  }, [filteredCourses, itemsPerPage]);

  return (
    <div className="py-40 px-40 bg-base-200 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-opunbold mb-3">My courses</h1>
          <p className="mb-5">Here you can create and manage your courses</p>
        </div>
        <Link className="btn btn-neutral" href="/course/create">
          Create new course
        </Link>
      </div>
      <div>
        <div className="flex flex-col  justify-between mb-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-12/12  mb-4 lg:mb-0"
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
      </div>
      <ul className="flex flex-col gap-4">
        {filteredCourses
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((course) => (
            <li
              className="p-6 bg-white rounded-md flex justify-between items-center hover:bg-base-300"
              key={course.id}
            >
              <div className="text-opun text-xl">
                <p className="font-opunsemibold mb-3">{course.title}</p>
                <div className="flex gap-2">
                  <p className="badge badge-neutral">{course.subject}</p>
                  <BadgeLevel level={course.level} />
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/course/${course.id}`} className="btn btn-outline">
                  View
                </Link>
                <Link
                  href={`/course/edit/${course.id}`}
                  className="btn btn-primary"
                >
                  Edit
                </Link>
                <button
                  className="btn btn-neutral"
                  onClick={async () => {
                    await createProduct(course);
                  }}
                >
                  Create Product
                </button>
                <Link
                  href={`/course/edit/${course.id}/student`}
                  className="btn btn-neutral"
                >
                  <UsersRound size={24} />
                </Link>

                <button
                  className="btn btn-error"
                  onClick={async () => {
                    setSelectedCourse(course);
                    const modal = document.getElementById("delete_modal");
                    if (modal) {
                      (modal as HTMLDialogElement).showModal();
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
      </ul>

      <div className="flex justify-center mt-10">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={(page) => setCurrentPage(page)}
        />
      </div>

      {isLoaded && filteredCourses.length === 0 && (
        <p className="text-center mt-10">No courses found.</p>
      )}

      <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          {selectedCourse && (
            <>
              <p className="py-4">
                Are you sure you want to delete the course &quot;
                {selectedCourse.title} &quot;?
              </p>
              <div className="modal-action">
                <button
                  className="btn btn-error"
                  onClick={() => handleDeleteCourse(selectedCourse.id)}
                >
                  Delete
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    const modal = document.getElementById("delete_modal");
                    if (modal) {
                      (modal as HTMLDialogElement).close();
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}

export default Teach;
