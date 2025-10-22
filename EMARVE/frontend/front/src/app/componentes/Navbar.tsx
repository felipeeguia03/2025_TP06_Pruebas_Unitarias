import React from "react";
import Search from "./Search";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faBook } from "@fortawesome/free-solid-svg-icons"; 

type NavbarProps = {
  onSearchResults: (courses: any[]) => void;
};

const Navbar: React.FC<NavbarProps> = ({ onSearchResults }) => {
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
          <Link href="/myCourses">
            <button className="bg-indigo-500 text-white font-bold py-2 px-4 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center">
              <FontAwesomeIcon icon={faBook} className="mr-2" />
              Mis Cursos
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
