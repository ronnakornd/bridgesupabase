"use client";

import React, { useState, useEffect, use } from "react";
import {
  fetchCourseById,
  addStudentToCourse,
  deleteStudentFromCourse,
} from "@/api/courses";
import { fetchStudentsByCourseId, fetchStudents } from "@/api/users";
import { Course } from "@/types/course";
import { User } from "@/types/user";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import Select from "react-select";
import Pagination from "@/components/Pagination";

interface StudentWithProgress extends User {
  progress: number | null;
}

export default function StudentManagement() {
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [allStudentsNotInThisCourse, setAllStudentsNotInThisCourse] = useState<
    User[]
  >([]);
  const [studentsSelectOptions, setStudentsSelectOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState("");
  const [selecetedStudentOption, setSelectedStudentOption] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 3;

  const addStudent = () => {
    if (selecetedStudentOption && course) {
      addStudentToCourse(course.id, selecetedStudentOption.value).then(
        (res) => {
          console.log(res);
          fetchStudentsInCourse(course.id);
          fetchAllStudentsThatNotInThisCourse();
        }
      );
    }
  };

  const deleteStudent = (id: string) => {
    if (course) {
      deleteStudentFromCourse(course?.id as string, id).then((res) => {
        console.log(res);
        if (res.status === "success") {
          fetchStudentsInCourse(course?.id as string);
        }
      });
    }
  };

  const fetchAllStudentsThatNotInThisCourse = async () => {
    const allFetchedStudents = await fetchStudents();
    console.log(allFetchedStudents);
    if (allFetchedStudents) {
      const studentsNotInCourse =
        course?.student_id && course.student_id.length > 0
          ? allFetchedStudents.filter(
              (student) => course.student_id.includes(student.id) === false
            )
          : allFetchedStudents;
      setAllStudentsNotInThisCourse(studentsNotInCourse);
      setStudentsSelectOptions(
        studentsNotInCourse.map((student) => ({
          value: student.id,
          label: student.first_name + " " + student.last_name,
        }))
      );
    }
  };

  const fetchStudentProgress = async (student: User) => {
    const progress = Math.floor(Math.random() * 100);
    return progress;
  };

  const fetchStudentsInCourse = async (course_id: string) => {
    if (course_id) {
      const studentsInCourse = await fetchStudentsByCourseId(id as string);
      if (studentsInCourse) {
        const studentsWithProgress = await Promise.all(
          studentsInCourse.map(async (student) => ({
            ...student,
            progress: await fetchStudentProgress(student),
          }))
        );
        setStudents(studentsWithProgress);
      }
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      const data = await fetchCourseById(id as string);
      if (data) {
        setCourse(data);
      }
    };
    if (id) {
      fetchCourseData();
    }
  }, []);

  useEffect(() => {
    if (course) {
      fetchAllStudentsThatNotInThisCourse();
      fetchStudentsInCourse(course.id);
    }
  }, [course]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = (student.first_name + " " + student.last_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    setTotalPages(Math.ceil(filteredStudents.length / itemsPerPage));
  }, [filteredStudents]);

  return (
    <div className="container mx-auto px-20 py-40 min-h-screen">
      <div>
        <h1 className="text-3xl font-opunbold mb-5">{course?.title}</h1>
      </div>
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">Student Management</h2>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter student name"
            value={newStudent}
            onChange={(e) => setNewStudent(e.target.value)}
            className="input input-bordered w-full"
          />
          <button
            onClick={() => {
              (
                document.getElementById(
                  "add_student_modal"
                ) as HTMLDialogElement
              )?.show();
            }}
            className="btn btn-secondary"
          >
            Add Student
          </button>
        </div>
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Progress (%)</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents
              .slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
              )
              .map((student) => (
                <tr key={student.id} className="border">
                  <td className="border p-2">
                    {student.first_name + " " + student.last_name}
                  </td>
                  <td className="border p-2">{student.progress}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => {
                        setStudentToDelete(student.id);
                        (
                          document.getElementById(
                            "delete_student_modal"
                          ) as HTMLDialogElement
                        )?.show();
                      }}
                      className="text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="p-5 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      <dialog id="add_student_modal" className="modal">
        <div className="modal-box p-10">
          <h3 className="font-bold text-lg">Add student to course</h3>
          <>
            <div className="z-30">
              <Select
                options={studentsSelectOptions}
                placeholder="Select student"
                onChange={(selectedOption) => {
                  setSelectedStudentOption(selectedOption);
                }}
              />
            </div>
            <div className="modal-action">
              <button
                className="btn btn-neutral"
                onClick={(e) => {
                  e.preventDefault();
                  addStudent();
                  (
                    document.getElementById(
                      "add_student_modal"
                    ) as HTMLDialogElement
                  )?.close();
                }}
              >
                Add Sudent
              </button>
              <button
                className="btn"
                onClick={(e) => {
                  e.preventDefault();
                  (
                    document.getElementById(
                      "add_student_modal"
                    ) as HTMLDialogElement
                  )?.close();
                }}
              >
                Cancel
              </button>
            </div>
          </>
        </div>
      </dialog>

      <dialog id="delete_student_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete Student</h3>
          <div>
            <p>Are you sure you want to delete this student?</p>
          </div>
          <div className="modal-action">
            <button
              className="btn btn-error"
              onClick={(e) => {
                e.preventDefault();
                if (studentToDelete) {
                  deleteStudent(studentToDelete);
                }
                (
                  document.getElementById(
                    "delete_student_modal"
                  ) as HTMLDialogElement
                )?.close();
              }}
            >
              Delete
            </button>
            <button
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                (
                  document.getElementById(
                    "delete_student_modal"
                  ) as HTMLDialogElement
                )?.close();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
