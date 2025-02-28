"use client";
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { fetchCourseById, updateCourse } from "@/api/courses";
import { uploadImage, deleteImage } from "@/api/images";
import { Course, Chapter } from "@/types/course";
import ChapterManager from "@/components/ChapterManager";
import LessonManager from "@/components/LessonManager";
import LessonContent from "@/components/LessonContent";
import Breadcrump from "@/components/Breadcrump";
import CourseEditor from "@/components/CourseEditor";

const EditCourse: React.FC = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState<string[]>([]);
  const [duration, setDuration] = useState(0);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const lessonParam = searchParams.get("lesson");

  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "beginner"
  );
  const [subject, setSubject] = useState<
    "math" | "science" | "language" | "social" | "coding" | "other"
  >("coding");
  const [price, setPrice] = useState(0);
  const [cover, setCover] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [coverImgFile, setCoverImgFile] = useState<File | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [tab, setTab] = useState(0);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    const getCourse = async () => {
      if (id) {
        const fetchedCourse = await fetchCourseById(
          Array.isArray(id) ? id[0] : id
        );
        if (fetchedCourse) {
          setCourse(fetchedCourse);
          setTitle(fetchedCourse.title);
          setDescription(fetchedCourse.description);
          setInstructor(fetchedCourse.instructor);
          setDuration(fetchedCourse.duration);
          setLevel(fetchedCourse.level);
          setSubject(fetchedCourse.subject);
          setPrice(fetchedCourse.price);
          setCover(fetchedCourse.cover);
          setTags(fetchedCourse.tags);
        }
      }
    };
    getCourse();
  }, [id]);

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (course) {
      if (!cover) {
        alert("Please upload a cover image");
        return;
      }
      let coverUrl = cover;
      if (coverImgFile) {
        const coverRespose = await uploadImage(coverImgFile, "cover_image");
        if (coverRespose.error) {
          alert("Failed to upload cover image");
          return;
        }
        if (coverRespose.data) {
          coverUrl = coverRespose.data;
        } else {
          alert("Failed to upload cover image");
          return;
        }
        if (coverUrl) {
          const coverFileName = cover.substring(cover.lastIndexOf("/") + 1);
          setCover(coverUrl);
          await deleteImage(coverFileName, "cover_image").then((res) => {
            if (res.error) {
              alert("Failed to delete old cover image");
            }
          });
        }
      }
      const updatedCourse = {
        title,
        description,
        instructor,
        duration,
        level,
        subject,
        price,
        cover: coverUrl,
        tags,
      };
      await updateCourse(course.id, updatedCourse);
      alert("Course updated successfully");
      window.location.reload();
    }
  };

  const handleTabChange = (tab: number) => {
    setTab(tab);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("tab", tab.toString());
    const newRelativePathQuery =
      window.location.pathname + "?" + searchParams.toString();
    window.history.pushState(null, "", newRelativePathQuery);
  };

  useEffect(() => {
    if (tabParam) {
      setTab(Number(tabParam));
    }
  }, [tabParam]);

  useEffect(() => {
    if (lessonParam) {
      setSelectedLessonId(lessonParam);
    }
  }, [lessonParam]);

  return (
    <div className="px-10 py-32 min-h-screen">
      <h1 className="text-4xl font-opunbold mb-4">Edit Course</h1>
      <Breadcrump directory={[{ name: title, href: `/course/edit/${id}` }]} />
      <div role="tablist" className="tabs tabs-lifted">
        <a
          role="tab"
          className={`tab ${tab == 0 ? "tab-active" : ""}`}
          onClick={() => handleTabChange(0)}
        >
          Info
        </a>
        <a
          role="tab"
          className={`tab ${tab == 1 ? "tab-active" : ""}`}
          onClick={() => handleTabChange(1)}
        >
          Layout
        </a>
        <a
          role="tab"
          className={`tab ${tab == 2 ? "tab-active" : ""}`}
          onClick={() => handleTabChange(2)}
        >
          Contents
        </a>
      </div>
      {course && (
        <div className="ml-[2px] bordered border-black shadow-md bg-base-100 ">
          {tab === 0 && (
            <CourseEditor
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              instructor={instructor}
              setInstructor={setInstructor}
              duration={duration}
              setDuration={setDuration}
              level={level}
              setLevel={setLevel}
              subject={subject}
              setSubject={setSubject}
              price={price}
              setPrice={setPrice}
              cover={cover}
              coverImgFile={coverImgFile}
              setCoverImgFile={setCoverImgFile}
              tags={tags}
              setTags={setTags}
              handleUpdateCourse={handleUpdateCourse}
            />
          )}
          {tab === 1 && (
            <div className="grid grid-cols-2 gap-4 bg-base-100 p-10 min-h-[70vh]">
              <ChapterManager onSelectedChapter={setSelectedChapter} />
              <LessonManager selectedChapter={selectedChapter} />
            </div>
          )}
          {tab === 2 && (
            <LessonContent courseId={course.id} courseTitle={course.title} selectedLessonId={selectedLessonId} />
          )}
        </div>
      )}
    </div>
  );
};

export default EditCourse;
