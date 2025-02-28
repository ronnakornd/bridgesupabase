export interface Chapter {
    id: string;
    title: string;
    course_id: string;
    index: number;
}

export interface Lesson {
    id: string;
    title: string;
    chapter_id: string;
    video_id: string | null;
    index: number;
}


export interface Course {
    id: string;
    title: string;
    cover: string;
    description: string;
    instructor: string[];
    instructor_id: string[];
    duration: number; // duration in minutes
    level: 'beginner' | 'intermediate' | 'advanced';
    subject: 'math' | 'science' | 'language' | 'social'| 'coding' | 'other';
    tags: string[];
    price: number; // price in THB
    created_at: Date;
    updated_at: Date;
    chapters: string[];
}

export interface TableOfContentsChapters extends Chapter {
    lessons: Lesson[];
  }
