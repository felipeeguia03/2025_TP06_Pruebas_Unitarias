import React, { useState } from "react";

type CourseDataProps = {
  id?: number;
  initialData?: {
    title: string;
    description: string;
    category: string;
    instructor: string;
    duration: number;
    requirement: string;
  };
  handleSubmit: (data: any) => void;
  handleClose: () => void;
};

const CourseData: React.FC<CourseDataProps> = ({
  id,
  initialData,
  handleSubmit,
  handleClose,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [instructor, setInstructor] = useState(initialData?.instructor || "");
  const [duration, setDuration] = useState(initialData?.duration || 0);
  const [requirement, setRequirement] = useState(initialData?.requirement || "");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit({
      title,
      description,
      category,
      instructor,
      duration,
      requirement,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 p-4">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg h-4/5 overflow-y-auto">
        <h2 className="text-2xl mb-2 text-center">Formulario del Curso</h2>
        <form onSubmit={handleFormSubmit}>
          <div className="mb-3">
            <label className="block text-gray-700">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1 border rounded-lg"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1 border rounded-lg"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700">Categoría</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-1 border rounded-lg"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700">Instructor</label>
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full px-3 py-1 border rounded-lg"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700">Duración (Semanas)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-1 border rounded-lg"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-700">Requisitos</label>
            <input
              type="text"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              className="w-full px-3 py-1 border rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-500 text-white px-3 py-1 rounded-lg mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-1 rounded-lg"
            >
              Listo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseData;
