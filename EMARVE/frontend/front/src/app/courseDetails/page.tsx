"use client";
import React, { useEffect, useState } from "react";
import {
  getCourseById,
  commentsList,
  getCourseImages,
  addComment,
  uploadFile,
  userAuthentication,
  getUserId,
  getBaseURL,
} from "@/app/utils/axios";
import NavbarAdmin from "../componentes/NavbarAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faComments,
  faImage,
  faArrowLeft,
  faUpload,
  faPaperPlane,
  faList,
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

export type comment = {
  id: number;
  user_id: number;
  course_id: number;
  comment: string;
  nickname?: string;
  userID?: number;
};

export type file = {
  id: number;
  user_id: number;
  course_id: number;
  name: string;
  url: string;
  upload_date: string;
};

export default function CourseDetails() {
  const [course, setCourse] = useState<course | null>(null);
  const [comments, setComments] = useState<comment[]>([]);
  const [images, setImages] = useState<file[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [fileSuccess, setFileSuccess] = useState(false);

  useEffect(() => {
    async function fetchCourseData() {
      try {
        const courseId = localStorage.getItem("CourseId");
        console.log("CourseId from localStorage:", courseId);

        if (!courseId) {
          console.log("No CourseId found in localStorage");
          setError("No se encontró ID de curso en localStorage");
          setLoading(false);
          return;
        }

        console.log("Fetching data for course ID:", courseId);

        // Obtener información del usuario
        const token = localStorage.getItem("tokenType");
        let userRole = null;
        let userId = null;

        if (token) {
          try {
            const role = await userAuthentication(token);
            const id = await getUserId(token);
            userRole = role;
            userId = parseInt(id);
            setUserRole(role);
            setUserId(userId);
            console.log("User role:", role, "User ID:", userId);
          } catch (error) {
            console.log("Error getting user info:", error);
          }
        }

        const [courseData, courseComments, courseImages] = await Promise.all([
          getCourseById(parseInt(courseId)),
          commentsList(parseInt(courseId)),
          getCourseImages(parseInt(courseId)),
        ]);

        console.log("Course data:", courseData);
        console.log("Comments:", courseComments);
        console.log("Images:", courseImages);

        setCourse(courseData);
        setComments(courseComments);
        setImages(courseImages);
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError(`Error al cargar los datos: ${error}`);
      } finally {
        setLoading(false);
      }
    }

    fetchCourseData();
  }, []);

  const handleSearchResults = (results: course[]) => {
    // Esta función se puede implementar más tarde si es necesario
  };

  const handleAddCourse = () => {
    // Esta función se puede implementar más tarde si es necesario
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !userId || !course) return;

    try {
      const commentRequest = {
        userID: userId,
        courseID: course.id,
        comment: newComment.trim(),
      };

      console.log("Sending comment request:", commentRequest);
      await addComment(commentRequest);
      setNewComment("");
      setCommentSuccess(true);

      // Recargar comentarios
      const courseComments = await commentsList(course.id);
      setComments(courseComments);
      console.log(
        "Comment added successfully, reloaded comments:",
        courseComments
      );

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !userId || !course) return;

    try {
      await uploadFile(selectedFile, userId, course.id);
      setSelectedFile(null);
      setFileSuccess(true);

      // Recargar archivos
      const courseImages = await getCourseImages(course.id);
      setImages(courseImages);

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setFileSuccess(false), 3000);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Cargando datos del curso...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-red-500 text-6xl mb-4"
          />
          <p className="text-white text-2xl mb-2">Error</p>
          <p className="text-red-400 text-lg">{error}</p>
          <p className="text-gray-400 text-sm mt-4">
            CourseId en localStorage:{" "}
            {localStorage.getItem("CourseId") || "No encontrado"}
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-full min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-red-500 text-6xl mb-4"
          />
          <p className="text-white text-2xl">Curso no encontrado</p>
          <p className="text-gray-400 text-sm mt-4">
            CourseId en localStorage:{" "}
            {localStorage.getItem("CourseId") || "No encontrado"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-800">
      <NavbarAdmin
        onSearchResults={handleSearchResults}
        onAddCourse={handleAddCourse}
      />
      <div className="pt-16 w-full flex flex-col items-center justify-start overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => (window.location.href = "/home")}
                className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Volver al Home
              </button>
              {userRole === "student" && (
                <button
                  onClick={() => (window.location.href = "/home")}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faList} className="mr-2" />
                  Todos los Cursos
                </button>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white text-center flex-1">
              {course.title}
            </h1>
            <div className="w-32"></div> {/* Spacer para centrar el título */}
          </div>

          <div className="bg-gray-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Información del Curso
            </h3>
            <p className="text-gray-300 mb-4">{course.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Categoría:</span>
                <span className="text-white ml-2">{course.category}</span>
              </div>
              <div>
                <span className="text-gray-400">Instructor:</span>
                <span className="text-white ml-2">{course.instructor}</span>
              </div>
              <div>
                <span className="text-gray-400">Duración:</span>
                <span className="text-white ml-2">{course.duration} horas</span>
              </div>
              <div>
                <span className="text-gray-400">Requisitos:</span>
                <span className="text-white ml-2">{course.requirement}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FontAwesomeIcon icon={faImage} className="mr-2" />
              Archivos ({images.length})
            </h3>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => {
                  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(
                    image.name
                  );
                  const isPdf = /\.pdf$/i.test(image.name);

                  return (
                    <div key={image.id} className="bg-gray-700 rounded-lg p-4">
                      {isImage ? (
                        <img
                          src={`${getBaseURL()}/${image.url}`}
                          alt={image.name}
                          className="w-full h-32 object-cover rounded mb-2"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-image.png";
                          }}
                        />
                      ) : isPdf ? (
                        <div className="w-full h-32 bg-red-100 rounded mb-2 flex items-center justify-center">
                          <div className="text-center">
                            <FontAwesomeIcon
                              icon={faImage}
                              className="text-red-500 text-4xl mb-2"
                            />
                            <p className="text-red-600 text-xs">PDF</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center">
                          <div className="text-center">
                            <FontAwesomeIcon
                              icon={faImage}
                              className="text-gray-500 text-4xl mb-2"
                            />
                            <p className="text-gray-600 text-xs">Archivo</p>
                          </div>
                        </div>
                      )}
                      <p className="text-gray-300 text-sm truncate">
                        {image.name}
                      </p>
                      <a
                        href={`${getBaseURL()}/${image.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 text-xs hover:text-indigo-300"
                      >
                        Ver archivo
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FontAwesomeIcon
                  icon={faImage}
                  className="text-gray-500 text-4xl mb-2"
                />
                <p className="text-gray-400">No hay archivos en este curso</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FontAwesomeIcon icon={faComments} className="mr-2" />
              Comentarios ({comments.length})
            </h3>

            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-indigo-400 font-semibold">
                        {comment.nickname ||
                          `Usuario ${comment.userID || comment.user_id}`}
                      </span>
                    </div>
                    <p className="text-gray-300">{comment.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FontAwesomeIcon
                  icon={faComments}
                  className="text-gray-500 text-4xl mb-2"
                />
                <p className="text-gray-400">
                  No hay comentarios en este curso
                </p>
              </div>
            )}

            {/* Sección para agregar comentarios (solo para estudiantes) */}
            {userRole === "student" && userId && (
              <div className="mt-6 bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">
                  Agregar Comentario
                </h4>
                {commentSuccess && (
                  <div className="mb-3 p-2 bg-green-600 text-white rounded-lg text-sm">
                    ¡Comentario agregado exitosamente!
                  </div>
                )}
                <div className="flex space-x-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe tu comentario aquí..."
                    className="flex-1 bg-gray-600 text-white p-3 rounded-lg border border-gray-500 focus:border-indigo-400 focus:outline-none resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex items-center"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sección para subir archivos (solo para estudiantes) */}
          {userRole === "student" && userId && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                Subir Archivo
              </h3>
              <div className="bg-gray-700 rounded-lg p-4">
                {fileSuccess && (
                  <div className="mb-3 p-2 bg-green-600 text-white rounded-lg text-sm">
                    ¡Archivo subido exitosamente!
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="flex-1 bg-gray-600 text-white p-2 rounded-lg border border-gray-500 focus:border-indigo-400 focus:outline-none"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <button
                    onClick={handleFileUpload}
                    disabled={!selectedFile}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg flex items-center"
                  >
                    <FontAwesomeIcon icon={faUpload} className="mr-2" />
                    Subir
                  </button>
                </div>
                {selectedFile && (
                  <p className="text-gray-300 text-sm mt-2">
                    Archivo seleccionado: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
