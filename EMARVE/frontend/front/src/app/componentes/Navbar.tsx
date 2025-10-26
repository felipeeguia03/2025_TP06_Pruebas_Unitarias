import React, { useEffect, useState } from "react";
import Search from "./Search";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBook,
  faSignOutAlt,
  faList,
  faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";
import { logout, userAuthentication } from "../utils/axios";

type NavbarProps = {
  onSearchResults: (courses: any[]) => void;
};

const Navbar: React.FC<NavbarProps> = ({ onSearchResults }) => {
  const [userRole, setUserRole] = useState<string>();

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const tokenType = localStorage.getItem("tokenType");
        if (tokenType) {
          const role = await userAuthentication(tokenType);
          setUserRole(role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    }

    fetchUserRole();
  }, []);

  const handleAddCourse = () => {
    // Redirigir a la página de home donde está el modal de crear curso
    window.location.href = "/home";
  };
  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 duration-300 h-16 flex items-center p-3 z-10">
      <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={logout} className="flex items-center">
            <FontAwesomeIcon
              icon={faSignOutAlt}
              className="text-white bg-red-500 rounded-full p-2 hover:bg-red-600"
            />
            <span className="ml-2 text-white text-sm">Cerrar Sesión</span>
          </button>
        </div>
        <div className="flex-1 mx-4 flex justify-center">
          <Search onSearchResults={onSearchResults} />
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/home">
            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center">
              <FontAwesomeIcon icon={faList} className="mr-2" />
              Todos los Cursos
            </button>
          </Link>
          <Link href="/myCourses">
            <button className="bg-indigo-500 text-white font-bold py-2 px-4 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center">
              <FontAwesomeIcon icon={faBook} className="mr-2" />
              Mis Cursos
            </button>
          </Link>
          {userRole === "admin" && (
            <button
              onClick={handleAddCourse}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
            >
              <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
              Crear Curso
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
