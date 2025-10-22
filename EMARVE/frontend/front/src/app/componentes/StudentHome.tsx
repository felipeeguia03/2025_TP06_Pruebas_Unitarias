"use client";
import React, { useEffect, useState } from 'react';
import { getCourses, getUserId, subscribe } from '@/app/utils/axios'; 
import Curso from '../componentes/Curso';
import Navbar from '../componentes/Navbar'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export type course = {
  id: number;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: number;
  requirement: string;
};

const StudentHome: React.FC = () => {
  const [courses, setCourses] = useState<course[]>([]);
  const [user_id, setUserId] = useState<number>();

  useEffect(() => {
    async function fetchUserId() {
      try {
        const tokenId = localStorage.getItem('tokenId');
        if (tokenId) {
          const Id = await getUserId(tokenId);
          localStorage.setItem('userId', Id); 
          console.log(Id); 
          setUserId(Id); 
        }
      } catch (error) {
        console.error("Error fetching user id:", error);
      }
    }
  fetchUserId();
  }, []);

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

  const handleSubscribe = async (course_id: number) => {
    const subscribeRequest = {user_id, course_id}
    try {
      await subscribe(subscribeRequest);
      console.log('Suscripción exitosa');
      alert("Inscripcion Exitosa")
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        alert("Ya se encuentra inscrito");
      } 
    }
  };

  return (
    <>
      <Navbar onSearchResults={handleSearchResults} /> 
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
                handleSubscribe={handleSubscribe} 
                message='Inscribirse'
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-6xl mb-4" />
            <p className="text-white text-4xl">No se encontraron cursos</p>
          </div>
        )}
      </div>
    </>
  );
}

export default StudentHome;
