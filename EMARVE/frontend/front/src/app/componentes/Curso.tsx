import React from "react";
import Link from "next/link";

type CourseProps = {
  id: number;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: number;
  requirement: string;
  handleSubscribe?: (id: number) => void;
  handleUpdate?: (id: number) => void;
  handleDelete?: (id: number) => void;
  message?: string;
};

const Curso: React.FC<CourseProps> = ({
  id,
  title,
  description,
  category,
  instructor,
  duration,
  requirement,
  handleSubscribe,
  handleUpdate,
  handleDelete,
  message,
}) => {
  const handleInfoClick = () => {
    localStorage.setItem('CourseId', id.toString());
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-gray-300 rounded-xl shadow-md overflow-hidden">
      <div className="md:flex">
        <div className="p-8 w-full">
          <div className="text-center">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              {category}
            </div>
            <h2 className="block mt-1 text-2xl leading-tight font-medium text-black">
              {title}
            </h2>
          </div>
          <p className="mt-4 text-gray-600 text-center">{description}</p>
          <div className="mt-4 text-center">
            <span className="text-gray-700 font-semibold">Instructor:</span>{" "}
            {instructor}
          </div>
          <div className="mt-2 text-center">
            <span className="text-gray-700 font-semibold">Duración:</span>{" "}
            {duration} Semanas
          </div>
          <div className="mt-2 text-center">
            <span className="text-gray-700 font-semibold">Requisitos:</span>{" "}
            {requirement}
          </div>
          <div className="flex justify-center mt-6 space-x-4">
            {handleSubscribe && message && message === "Inscribirse" && (
              <button
                onClick={() => handleSubscribe(id)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded"
              >
                {message}
              </button>
            )}
            {message && message === "+ Info" && (
              <Link href={"/courseDetails"} onClick={handleInfoClick}>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                  {message}
                </button>
              </Link>
            )}
            {handleUpdate && (
              <button
                onClick={() => handleUpdate(id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
              >
                Modificar
              </button>
            )}
            {handleDelete && (
              <button
                onClick={() => handleDelete(id)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Curso;
