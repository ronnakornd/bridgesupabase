"use client";
import React, { useState, useEffect } from "react";
import { addCourse } from "@/api/courses";
import { Course } from "@/types/course";
import { fetchProfile } from "@/api/users";
import { uploadImage } from "@/api/images";
import { supabase } from "@/libs/supabase/client";

const CreateCourse: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [instructor_id, setInstructorId] = useState("");
  const [coverImgFile, setCoverImgFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "beginner"
  );
  const [subject, setSubject] = useState<
    "math" | "science" | "language" | "social" | "coding" | "other"
  >("coding");
  const [price, setPrice] = useState(0);
  const [cover, setCover] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImgFile) {
      alert("Please upload a cover image");
      return;
    }
    const coverRespose = await uploadImage(coverImgFile, "cover_image");
    if (!coverRespose) {
      alert("Failed to upload cover image");
      return;
    }
    const coverUrl = coverRespose.data;
    setCover(coverUrl || "");

    const newCourse: Omit<Course, "id" | "created_at" | "updated_at"> = {
      title,
      description,
      instructor: [instructor],
      instructor_id: [instructor_id],
      duration,
      level,
      subject,
      tags: [],
      price,
      cover: coverUrl || "",
      chapters: [],
    };
    try {
      let data = await addCourse(newCourse);
      alert("Course created successfully");
      console.log(data);
      window.location.href = "/course/" + data.id;
    } catch (error) {
      alert("Failed to create course");
    }
  };

  useEffect(() => {
    const fetchInstructor = async () => {
      const profile = await fetchProfile();
      if (profile) {
        setInstructor(profile.first_name + " " + profile.last_name);
        setInstructorId(profile.id);
      }
    };
    fetchInstructor();
  }, []);

  return (
    <div className="py-40 px-40 bg-base-200">
      <h1 className="text-3xl font-opunbold mb-4">Create New Course</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-bold text-xl">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-bold text-xl">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-bold text-xl">Instructor</label>
          <p>{instructor}</p>
        </div>
        <div>
          <label className="block mb-2 font-bold text-xl">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-bold text-xl">Level</label>
          <select
            value={level}
            onChange={(e) =>
              setLevel(
                e.target.value as "beginner" | "intermediate" | "advanced"
              )
            }
            className="select select-bordered w-full"
            required
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-bold text-xl">Subject</label>
          <select
            value={subject}
            onChange={(e) =>
              setSubject(
                e.target.value as
                  | "math"
                  | "science"
                  | "language"
                  | "social"
                  | "coding"
                  | "other"
              )
            }
            className="select select-bordered w-full"
            required
          >
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="language">Language</option>
            <option value="social">Social</option>
            <option value="coding">Coding</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 font-bold text-xl">Price (บาท)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseInt(e.target.value))}
            className="input input-bordered w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-bold text-xl">Cover Image</label>
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setCoverImgFile(e.target.files[0]);
              }
            }}
          />
        </div>
        <div className="flex justify-center">
          <button type="submit" className="btn btn-primary w-1/4">
            Create Course
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;
