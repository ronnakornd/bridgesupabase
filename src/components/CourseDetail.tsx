import React from 'react';
import { Course, Chapter } from '@/types/course';

interface CourseDetailProps {

    course: Course;
  
  }
  
const CourseDetail: React.FC<CourseDetailProps> = ({course}) => {
    if (!course) {
        return <div>Course not found</div>;
    }
    console.log(course);
    return (
        <div className="py-40 px-40 w-full flex flex-col justify-normal items-center min-h-screen">
            <div className="card bg-base-100 shadow-xl mb-4 w-3/4">
                <div className="card-body">
                    <h1 className="card-title text-3xl">{course.title}</h1>
                    <p>{course.description}</p>
                    <img src={course.cover} alt={course.title} className="w-full h-48 object-cover rounded-md mb-3" />
                    <p><strong>Instructor: </strong>
                        {course.instructor.map((instructor, index) => (
                            <span key={course.instructor_id[index]}>{instructor}</span>
                        ))}
                    </p>
                    <p><strong>Duration:</strong> {course.duration} minutes</p>
                    <p><strong>Level:</strong> {course.level}</p>
                    <p><strong>Subject:</strong> {course.subject}</p>
                    <p><strong>Price:</strong> {course.price} บาท</p>
                    <div className="card-actions justify-end">
                        <button className="btn btn-primary">Enroll</button>
                    </div>
                </div>
            </div>
            <div className='w-3/4 mt-5 card bg-base-100 shadow-xl'>
            <div className='card-body'>
                <h2 className="text-2xl font-bold mb-2">Course Chapters</h2>
                <ul className="list-disc pl-5">
                    {course.chapters && course.chapters.length > 0 && course.chapters.map(chapter => (
                        <li key={chapter.id} className="mb-2">
                            <div className="flex justify-between">
                                <span>{chapter.title}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;