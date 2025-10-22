import React from "react";
import Search from "./Search";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faPlusCircle } from "@fortawesome/free-solid-svg-icons"; 

type NavbarAdminProps = {
  onSearchResults: (courses: any[]) => void;
  onAddCourse: () => void;
};

const NavbarAdmin: React.FC<NavbarAdminProps> = ({ onSearchResults, onAddCourse }) => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 duration-300 h-16 flex items-center p-3 z-10">
      <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href={"/home"}>
            <FontAwesomeIcon 
              icon={faHome} 
              className="text-white bg-indigo-500 rounded-full p-2 hover:bg-indigo-600" 
            />
          </Link>
        </div>
        <div className="flex-1 mx-4 flex justify-center">
          <Search onSearchResults={onSearchResults} />
        </div>
        <div className="flex items-center">
          <button onClick={onAddCourse} className="bg-indigo-500 text-white font-bold py-2 px-4 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center">
            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
            Añadir Curso
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarAdmin;
