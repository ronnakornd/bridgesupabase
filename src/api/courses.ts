import { createClient } from "@/libs/supabase/client";
import { Course, Chapter, Lesson } from "@/types/course";
import { PostgrestError } from "@supabase/supabase-js";

// Fetch all courses
export const fetchCourses = async (): Promise<Course[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("courses").select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data as Course[];
};

// Fetch a single course by ID
export const fetchCourseById = async (id: string): Promise<Course | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Course;
};

export const fetchCourseByinstructorId = async (
  instructorId: string
): Promise<Course[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .contains("instructor_id", [instructorId]);

  if (error) {
    throw new Error(error.message);
  }
  return data as Course[];
};

// Add a new course
export const addCourse = async (
  course: Omit<Course, "id" | "created_at" | "updated_at">
): Promise<{ data: Course; error: PostgrestError | null }> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .insert([
      {
        ...course,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }

  return { data, error };
};

// Update an existing course
export const updateCourse = async (
  id: string,
  course: Partial<Omit<Course, "id" | "created_at" | "updated_at">>
): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from("courses")
    .update({
      ...course,
      updated_at: new Date(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

// Delete a course
export const deleteCourse = async (id: string): Promise<void> => {
  const supabase = createClient();
  
  // First, fetch all chapters in this course
  const { data: chapters, error: fetchChaptersError } = await supabase
    .from("chapters")
    .select("id")
    .eq("course_id", id);
    
  if (fetchChaptersError) {
    throw new Error(fetchChaptersError.message);
  }
  
  // Delete all lessons in all chapters of this course
  if (chapters && chapters.length > 0) {
    const chapterIds = chapters.map(chapter => chapter.id);
    
    // Delete all lessons associated with these chapters
    const { error: deleteLessonsError } = await supabase
      .from("lessons")
      .delete()
      .in("chapter_id", chapterIds);
      
    if (deleteLessonsError) {
      throw new Error(deleteLessonsError.message);
    }
    
    // Delete all chapters
    const { error: deleteChaptersError } = await supabase
      .from("chapters")
      .delete()
      .in("id", chapterIds);
      
    if (deleteChaptersError) {
      throw new Error(deleteChaptersError.message);
    }
  }
  
  // Delete cart items containing this course
  const { error: deleteCartError } = await supabase
    .from("carts")
    .delete()
    .eq("course_id", id);
    
  if (deleteCartError) {
    console.log("deleteCartError", deleteCartError);
    throw new Error(deleteCartError.message);
  }
  
  // Finally delete the course itself
  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

// Fetch all chapters of a course
export const fetchChapters = async (courseId: string): Promise<Chapter[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("course_id", courseId);

  if (error) {
    throw new Error(error.message);
  }

  return data as Chapter[];
};

// Add a new chapter
export const addChapter = async (
  chapter: Omit<Chapter, "id" | "created_at" | "updated_at">
): Promise<Chapter> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chapters")
    .insert([
      {
        ...chapter,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Update an existing chapter
export const updateChapter = async (
  id: string,
  chapter: Partial<Omit<Chapter, "id" | "created_at" | "updated_at">>
): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from("chapters")
    .update({
      ...chapter,
      updated_at: new Date(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

// Delete a chapter
export const deleteChapter = async (id: string): Promise<void> => {
  const supabase = createClient();
  
  // First, fetch all lessons in this chapter
  const { data: lessons, error: fetchError } = await supabase
    .from("lessons")
    .select("id")
    .eq("chapter_id", id);
    
  if (fetchError) {
    throw new Error(fetchError.message);
  }
  
  // Delete all lessons in this chapter if any exist
  if (lessons && lessons.length > 0) {
    const lessonIds = lessons.map(lesson => lesson.id);
    const { error: deleteError } = await supabase
      .from("lessons")
      .delete()
      .in("id", lessonIds);
      
    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }
  
  // Now delete the chapter itself
  const { error } = await supabase.from("chapters").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

// Fetch all lessons of a chapter
export const fetchLessons = async (chapterId: string): Promise<Lesson[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("chapter_id", chapterId);

  if (error) {
    throw new Error(error.message);
  }

  return data as Lesson[];
};

// Add a new lesson
export const addLesson = async (
  lesson: Omit<Lesson, "id" | "created_at" | "updated_at">
): Promise<Lesson> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lessons")
    .insert([
      {
        ...lesson,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Update an existing lesson
export const updateLesson = async (
  id: string,
  lesson: Partial<Omit<Lesson, "id" | "created_at" | "updated_at">>
): Promise<void> => {
  const supabase = createClient();
  console.log(lesson);
  const { error } = await supabase
    .from("lessons")
    .update({
      ...lesson,
      updated_at: new Date(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

// Delete a lesson
export const deleteLesson = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};

// Fetch a single lesson by ID
export const fetchLessonById = async (id: string): Promise<Lesson | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Lesson;
};

// Fetch a single chapter by ID
export const fetchChapterById = async (id: string): Promise<Chapter | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Chapter;
};

// Fetch chapters by course ID
export const fetchChaptersByCourseId = async (
  courseId: string
): Promise<Chapter[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("course_id", courseId)
    .order("index", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }

  return data as Chapter[];
};

// Fetch lessons by chapter ID
export const fetchLessonsByChapterId = async (
  chapterId: string
): Promise<Lesson[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("chapter_id", chapterId)
    .order("index", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }

  return data as Lesson[];
};

export const addStudentToCourse = async (
  courseId: string,
  studentId: string
): Promise<{ status: string; text: string }> => {
  const supabase = createClient();

  // First, get the current student_id array
  const { data, error: fetchError } = await supabase
    .from("courses")
    .select("student_id")
    .eq("id", courseId)
    .single();

  if (fetchError) {
    return { status: "failed", text: fetchError.message };
  }

  // Check if student already exists in the array
  const currentStudents = data.student_id || [];
  if (currentStudents.includes(studentId)) {
    return {
      status: "failed",
      text: "Student already in course, no need to update",
    }; // Student already in course, no need to update
  }

  // Add new student to the array
  const updatedStudents = [...currentStudents, studentId];

  console.log("updatedStudents", updatedStudents);

  // Update the database with the new array
  const { error: updateError } = await supabase
    .from("courses")
    .update({
      student_id: updatedStudents,
    })
    .eq("id", courseId);



  if (updateError) {
    throw new Error(updateError.message);
  }

  return { status: "success", text: "Student added to course successfully" };
};

export const deleteStudentFromCourse = async (
  courseId: string,
  studentId: string
): Promise<{ status: string; text: string }> => {
  const supabase = createClient();
  const { data, error: fetchError } = await supabase
    .from("courses")
    .select("student_id")
    .eq("id", courseId)
    .single();

  if (fetchError) {
    return { status: "failed", text: fetchError.message };
  }

  const currentStudents = data.student_id || [];
  if (!currentStudents.includes(studentId)) {
    return {
      status: "failed",
      text: "Student not in course, no need to update",
    };
  }

  const updatedStudents = currentStudents.filter(
    (id: string) => id !== studentId
  );

  const { error: updateError } = await supabase
    .from("courses")
    .update({
      student_id: updatedStudents,
    })
    .eq("id", courseId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    status: "success",
    text: "Student removed from course successfully",
  };
};
