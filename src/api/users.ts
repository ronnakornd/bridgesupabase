
import { createClient } from '@/libs/supabase/client';
import { User } from '@/types/user';


 export const fetchProfile = async (): Promise<User | null> => {
      const supabase = createClient();
      const user = await supabase.auth.getUser();
      if (!user) {
        return null;
      }
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.data.user?.id)
        .single();
      if (data) {
       return data;
      }
      if (error) {
        console.log("Error fetching user profile:", error);
        return null;
      }
      return null;
};


export const fetchStudents = async (): Promise<User[] | null> => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student');
    if (error) {
        console.error('Failed to fetch students:', error.message);
        return null;
    }
    return data as User[];
}


export const fetchStudentsByCourseId = async (course_id: string): Promise<User[] | null> => {
    const supabase = createClient();
   const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('student_id')
        .eq('id', course_id)
        .single();
    if (courseError) {
        console.error('Failed to fetch course:', courseError.message);
        return null;
    }
    if (!courseData) {
        console.error('Course not found');
        return null;
    }
    const studentIds = courseData.student_id;
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('id', studentIds);
    
    if (error) {
        console.error('Failed to fetch students:', error.message);
        return null;
    }
    return data as User[];
}