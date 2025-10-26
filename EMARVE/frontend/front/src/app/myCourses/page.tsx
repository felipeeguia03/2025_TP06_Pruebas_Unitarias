"use client";
import React, { useEffect, useState } from "react";
import {
  getUserId,
  subscriptionList,
  userAuthentication,
  getCoursesByInstructor,
} from "@/app/utils/axios";
import Curso from "../componentes/Curso";
import Navbar from "../componentes/Navbar";
import CourseData from "../componentes/CourseData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";

export type course = {
  id: number;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: number;
  requirement: string;
};

export default function MyCourses() {
  const [courses, setCourses] = useState<course[]>([]);
  const [userId, setUserId] = useState<number>();
  const [userRole, setUserRole] = useState<string>();
  const [showModal, setShowModal] = useState(false);
  const [courseToUpdate, setCourseToUpdate] = useState<course | null>(null);

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const tokenId = localStorage.getItem("tokenId");
        const tokenType = localStorage.getItem("tokenType");

        if (tokenId && tokenType) {
          const [Id, role] = await Promise.all([
            getUserId(tokenId),
            userAuthentication(tokenType),
          ]);

          console.log("Fetched User ID:", Id);
          console.log("Fetched User Role:", role);
          setUserId(Id);
          setUserRole(role);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }

    fetchUserInfo();
  }, []);

  useEffect(() => {
    console.log("User ID changed:", userId, "User Role:", userRole);
    async function fetchCourses() {
      try {
        if (userId && userId > 0) {
          let data: course[] = [];

          if (userRole === "admin") {
            // Para admin/profesor, obtener todos los cursos que ha creado
            const tokenType = localStorage.getItem("tokenType");
            if (tokenType) {
              const userInfo = await userAuthentication(tokenType);
              data = await getCoursesByInstructor(userInfo);
            }
          } else {
            // Para estudiantes, obtener cursos suscritos
            data = await subscriptionList(userId);
          }

          setCourses(data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }

    fetchCourses();
  }, [userId, userRole]);

  const handleAddCourse = () => {
    setCourseToUpdate(null);
    setShowModal(true);
  };

  const handleUpdate = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    setCourseToUpdate(course || null);
    setShowModal(true);
  };

  const handleDelete = async (courseId: number) => {
    try {
      const { deleteCourse } = await import("@/app/utils/axios");
      await deleteCourse(courseId);
      setCourses(courses.filter((course) => course.id !== courseId));
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      const { createCourse, updateCourse, getCoursesByInstructor } =
        await import("@/app/utils/axios");

      if (courseToUpdate) {
        await updateCourse(courseToUpdate.id, data);
      } else {
        await createCourse(data);
      }
      setShowModal(false);

      // Recargar cursos según el rol
      if (userRole === "admin") {
        const tokenType = localStorage.getItem("tokenType");
        if (tokenType) {
          const userInfo = await userAuthentication(tokenType);
          const updatedCourses = await getCoursesByInstructor(userInfo);
          setCourses(updatedCourses);
        }
      } else {
        const updatedCourses = await subscriptionList(userId!);
        setCourses(updatedCourses);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-800">
      <Navbar onSearchResults={(): void => {}} />
      <div className="pt-16 w-full flex flex-col items-center justify-start overflow-y-auto">
        {/* Botón de crear curso para profesores */}
        {userRole === "admin" && (
          <div className="w-full max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">
                Mis Cursos Creados
              </h1>
              <button
                onClick={handleAddCourse}
                className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
              >
                <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                Crear Nuevo Curso
              </button>
            </div>
          </div>
        )}
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
                handleSubscribe={
                  userRole === "admin"
                    ? () => handleUpdate(course.id)
                    : () => {}
                }
                handleUpdate={
                  userRole === "admin"
                    ? () => handleUpdate(course.id)
                    : undefined
                }
                handleDelete={
                  userRole === "admin"
                    ? () => handleDelete(course.id)
                    : undefined
                }
                message={userRole === "admin" ? "Editar" : "+ Info"}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-red-500 text-6xl mb-4"
            />
            <p className="text-white text-4xl">No se encontraron cursos</p>
          </div>
        )}
      </div>
      {showModal && userRole === "admin" && (
        <CourseData
          id={courseToUpdate?.id}
          initialData={courseToUpdate || undefined}
          handleSubmit={handleFormSubmit}
          handleClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
