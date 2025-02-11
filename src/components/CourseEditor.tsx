// components/CourseEditor.tsx
"use client";
import React from "react";

interface CourseEditorProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  instructor: string[];
  setInstructor: (value: string[]) => void;
  duration: number;
  setDuration: (value: number) => void;
  level: "beginner" | "intermediate" | "advanced";
  setLevel: (value: "beginner" | "intermediate" | "advanced") => void;
  subject: "math" | "science" | "language" | "social" | "coding" | "other";
  setSubject: (
    value: "math" | "science" | "language" | "social" | "coding" | "other"
  ) => void;
  price: number;
  setPrice: (value: number) => void;
  cover: string;
  coverImgFile: File | null;
  setCoverImgFile: (file: File | null) => void;
  tags: string[];
  setTags: (value: string[]) => void;
  handleUpdateCourse: (e: React.FormEvent<HTMLFormElement>) => void;
}

const CourseEditor: React.FC<CourseEditorProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  instructor,
  setInstructor,
  duration,
  setDuration,
  level,
  setLevel,
  subject,
  setSubject,
  price,
  setPrice,
  cover,
  setCoverImgFile,
  tags,
  setTags,
  handleUpdateCourse,
}) => {
  return (
    <div className="p-10">
      <form onSubmit={handleUpdateCourse}>
        <div className="grid grid-cols-2 gap-4 p-5">
          <div className="flex flex-col gap-2">
            {/* Title */}
            <div>
              <label className="block mb-1 font-opunsemibold text-xl">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered input-sm w-full"
                required
              />
            </div>
            {/* Description */}
            <div>
              <label className="block mb-1 font-opunsemibold text-xl">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-sm textarea-bordered w-full"
                required
              />
            </div>
            {/* Instructor */}
            <div>
              <label className="block my-2 font-opunsemibold text-xl">
                Instructor
              </label>
              <input
                type="text"
                value={instructor.join(", ")}
                onChange={(e) => setInstructor(e.target.value.split(", "))}
                className="input input-sm input-bordered w-full"
                required
              />
            </div>
            {/* Duration */}
            <div>
              <label className="block my-2 font-opunsemibold text-xl">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="input input-sm input-bordered w-full"
                required
              />
            </div>
            {/* Level */}
            <div>
              <label className="block my-2 font-opunsemibold text-xl">
                Level
              </label>
              <select
                value={level}
                onChange={(e) =>
                  setLevel(
                    e.target.value as "beginner" | "intermediate" | "advanced"
                  )
                }
                className="select select-sm select-bordered w-full"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            {/* Subject */}
            <div>
              <label className="block my-2 font-opunsemibold text-xl">
                Subject
              </label>
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
            {/* Price */}
            <div>
              <label className="block my-2 font-opunsemibold text-xl">
                Price (บาท)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value))}
                className="input input-sm input-bordered w-full"
                required
              />
            </div>
          </div>
           
           <div>

          
          {/* Cover Image */}
          <div>
            <label className="block my-2 font-opunsemibold text-xl">
              Cover Image
            </label>
            {cover && <img src={cover} alt="Course Cover" className="mb-3 w-[500px] h-[300px] object-cover" />}
            <input
              type="file"
              className="file-input file-input-bordered mt-3 w-full"
              onChange={(e) =>
                setCoverImgFile(e.target.files ? e.target.files[0] : null)
              }
            />
          </div>
              {/* Tags */}
              <div>
            <label className="block my-2 font-opunsemibold text-xl">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags.join(",")}
              onChange={(e) => setTags(e.target.value.split(", "))}
              className="input input-sm input-bordered w-full"
            />
          </div>
          </div>
        </div>
        <div className="flex justify-center">
        <button type="submit" className="btn btn-neutral shadow-xl w-full">
          Update Course
        </button>
        </div>
      </form>
    </div>
  );
};

export default CourseEditor;
