export interface Progress {
    id: string;
    course_id: string;
    user_id: string;    
    lesson_id: string;
    completed: boolean;
    playhead: number;
    updated_at: Date;
    created_at: Date;
}