import React, { useState } from "react";
import { search } from "@/app/utils/axios"; 

type SearchProps = {
  onSearchResults: (courses: any[]) => void;
};

const Search: React.FC<SearchProps> = ({ onSearchResults }) => {
  const [query, setQuery] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    console.log("Query: ", e.target.value);
    setQuery(e.target.value);
  };

  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (query.trim() === "") {
        const response = await search("");
        onSearchResults(response.results);
      } else {
        const response = await search(query);
        onSearchResults(response.results);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="SearchBar">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="block w-[500px] p-2 pl-10 focus:border-blue-500 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500 appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Busca algún curso..."
            value={query}
            onChange={handleSearchChange}
          />
        </form>
      </div>
    </div>
  );
};

export default Search;
