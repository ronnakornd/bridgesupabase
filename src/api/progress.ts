// src/api/progress.ts
import { createClient } from '@/libs/supabase/client';
import { Progress } from '@/types/progress';

export interface ProgressUpdate {
    course_id: string;
    user_id: string;    
    lesson_id: string;
    playhead: number;
    completed?: boolean;
}


export const startProgress = async (course_id: string, user_id: string, lesson_id: string): Promise<Progress | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('progresses')
        .insert({
            course_id,
            user_id,
            lesson_id,
            playhead: 0, // Initialize playhead to 0
            completed: false,
            updated_at: new Date(),
            created_at: new Date()
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to start progress:', error.message);
        return null;
    }
    return data as Progress;
};

export const updateProgress = async (progress: ProgressUpdate): Promise<Progress | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('progresses')
        .update({
            course_id: progress.course_id,
            user_id: progress.user_id,
            lesson_id: progress.lesson_id,
            playhead: progress.playhead,
            completed: progress.completed,
            updated_at: new Date()
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to update progress:', error.message);
        return null;
    }
    return data as Progress | null;
};

export const fetchProgress = async (course_id: string, user_id: string, lesson_id: string): Promise<Progress | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('progresses')
        .select('*')
        .eq('course_id', course_id)
        .eq('user_id', user_id)
        .eq('lesson_id', lesson_id)
        .single();
    if (error) {
        console.error('Failed to fetch progress:', error.message);
        return null;
    }
    return data as Progress;
};


export const deleteProgress = async (course_id: string, user_id: string, lesson_id: string): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase
        .from('progresses')
        .delete()
        .eq('course_id', course_id)
        .eq('user_id', user_id)
        .eq('lesson_id', lesson_id);
    if (error) {
        console.error('Failed to delete progress:', error.message);
    }
}

export const fetchProgressByCourseId = async (course_id: string): Promise<Progress[] | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('progresses')
        .select('*')
        .eq('course_id', course_id);
    if (error) {
        console.error('Failed to fetch progress:', error.message);
        return null;
    }
    return data as Progress[];
}

export const fetchUserProgressByCourseId = async (course_id: string, user_id: string): Promise<Progress[] | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('progresses')
        .select('*')
        .eq('course_id', course_id)
        .eq('user_id', user_id);
    if (error) {
        console.error('Failed to fetch progress:', error.message);
        return null;
    }
    return data as Progress[];
}