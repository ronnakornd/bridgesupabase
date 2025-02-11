import { supabase } from '@/libs/supabase/client';
import { Course, Chapter, Lesson } from '@/types/course';
import { PostgrestError } from '@supabase/supabase-js';

// Fetch all courses
export const fetchCourses = async (): Promise<Course[]> => {
    const { data, error } = await supabase
        .from('courses')
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data as Course[];
};

// Fetch a single course by ID
export const fetchCourseById = async (id: string): Promise<Course | null> => {
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as Course;
};

// Add a new course
export const addCourse = async (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<{data: Course, error: PostgrestError|null}> => {
    const {data, error } = await supabase
        .from('courses')
        .insert([
            {
                ...course,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]).select().single();
    if (error) {
        throw new Error(error.message);
    }

    return {data, error};
};

// Update an existing course
export const updateCourse = async (id: string, course: Partial<Omit<Course, 'id' | 'created_at' | 'updated_at'>>): Promise<void> => {
    const { error } = await supabase
        .from('courses')
        .update({
            ...course,
            updated_at: new Date(),
        })
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
};

// Delete a course
export const deleteCourse = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
};

// Fetch all chapters of a course
export const fetchChapters = async (courseId: string): Promise<Chapter[]> => {
    const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('course_id', courseId);

    if (error) {
        throw new Error(error.message);
    }

    return data as Chapter[];
};

// Add a new chapter
export const addChapter = async (chapter: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>): Promise<Chapter> => {
    const { data, error } = await supabase
        .from('chapters')
        .insert([
            {
                ...chapter,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]).select().single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
};

// Update an existing chapter
export const updateChapter = async (id: string, chapter: Partial<Omit<Chapter, 'id' | 'created_at' | 'updated_at'>>): Promise<void> => {
    const { error } = await supabase
        .from('chapters')
        .update({
            ...chapter,
            updated_at: new Date(),
        })
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
};

// Delete a chapter
export const deleteChapter = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
};

// Fetch all lessons of a chapter
export const fetchLessons = async (chapterId: string): Promise<Lesson[]> => {
    const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('chapter_id', chapterId);

    if (error) {
        throw new Error(error.message);
    }

    return data as Lesson[];
};

// Add a new lesson
export const addLesson = async (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<Lesson> => {
    const { data, error } = await supabase
        .from('lessons')
        .insert([
            {
                ...lesson,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]).select().single();
    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Update an existing lesson
export const updateLesson = async (id: string, lesson: Partial<Omit<Lesson, 'id' | 'created_at' | 'updated_at'>>): Promise<void> => {
    const { error } = await supabase
        .from('lessons')
        .update({
            ...lesson,
            updated_at: new Date(),
        })
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
};

// Delete a lesson
export const deleteLesson = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
};

// Fetch a single lesson by ID
export const fetchLessonById = async (id: string): Promise<Lesson | null> => {
    const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as Lesson;
};

// Fetch a single chapter by ID
export const fetchChapterById = async (id: string): Promise<Chapter | null> => {
    const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data as Chapter;
};

// Fetch chapters by course ID
export const fetchChaptersByCourseId = async (courseId: string): Promise<Chapter[]> => {
    const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('course_id', courseId);
    if (error) {
        throw new Error(error.message);
    }

    return data as Chapter[];
};

// Fetch lessons by chapter ID
export const fetchLessonsByChapterId = async (chapterId: string): Promise<Lesson[]> => {
    const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('chapter_id', chapterId);
    if (error) {
        throw new Error(error.message);
    }

    return data as Lesson[];
};