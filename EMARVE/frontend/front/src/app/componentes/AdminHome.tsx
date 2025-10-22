import React, { useEffect, useState } from 'react';
import { getCourses, deleteCourse, updateCourse, createCourse } from '@/app/utils/axios'; 
import Curso from '../componentes/Curso';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import NavbarAdmin from './NavbarAdmin';
import CourseData from '../componentes/CourseData';

export type course = {
  id: number;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: number;
  requirement: string;
};

const AdminHome: React.FC = () => {
  const [courses, setCourses] = useState<course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [courseToUpdate, setCourseToUpdate] = useState<course | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data: course[] = await getCourses();
        setCourses(data); 
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }
  
    fetchCourses();
  }, []);

  const handleSearchResults = (results: course[]) => {
    setCourses(results);
  };

  const handleUpdate = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    setCourseToUpdate(course || null);
    setShowModal(true);
  };

  const handleDelete = async (courseId: number) => {
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter((course) => course.id !== courseId));
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleAddCourse = () => {
    setCourseToUpdate(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (courseToUpdate) {
        await updateCourse(courseToUpdate.id, data);
      } else {
        await createCourse(data);
      }
      setShowModal(false);
      const updatedCourses = await getCourses();
      setCourses(updatedCourses);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <>
      <NavbarAdmin onSearchResults={handleSearchResults} onAddCourse={handleAddCourse} /> 
      <div className="pt-16 w-full flex flex-col items-center justify-start overflow-y-auto">
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Curso
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                category={course.category}
                instructor={course.instructor}
                duration={course.duration}
                requirement={course.requirement}
                handleUpdate={handleUpdate}
                handleDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-6xl mb-4" />
            <p className="text-white text-4xl">No se encontraron cursos</p>
          </div>
        )}
        {showModal && (
          <CourseData
            id={courseToUpdate?.id}
            initialData={courseToUpdate || undefined}
            handleSubmit={handleFormSubmit}
            handleClose={() => setShowModal(false)}
          />
        )}
      </div>
    </>
  );
};

export default AdminHome;
