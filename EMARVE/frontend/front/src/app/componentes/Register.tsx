"use client";
import React, { useState } from "react";
import Link from "next/link";
import { registration } from "../utils/axios";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState(false); // false = estudiante, true = profesor
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const registrationRequest = {
        nickname: username,
        email: email,
        password: password,
        type: userType,
      };
      const token = await registration(registrationRequest);
      console.log("Registration successful, token: ", token);
      setIsRegistered(true);
      window.location.href = "/home";
    } catch (error) {
      console.log(error);
      setError(
        "Hubo un error al crear la cuenta. Por favor, verifica los datos ingresados."
      );
    }
  };

  return (
    <div className="max-w-lg w-full">
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-center text-3xl font-extrabold text-white">
            Crea tu Cuenta!
          </h2>
          <form onSubmit={handleRegister} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm">
              <div>
                <label className="sr-only" htmlFor="username">
                  Username
                </label>
                <input
                  placeholder="Nombre de usuario"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required={true}
                  autoComplete="username"
                  type="text"
                  name="username"
                  id="username"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUsername(e.target.value)
                  }
                />
              </div>
              <div className="mt-4">
                <label className="sr-only" htmlFor="email">
                  Email
                </label>
                <input
                  placeholder="Email"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required={true}
                  autoComplete="email"
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                />
              </div>
              <div className="mt-4">
                <label className="sr-only" htmlFor="password">
                  Contraseña
                </label>
                <input
                  placeholder="Contraseña"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required={true}
                  autoComplete="current-password"
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Usuario
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="userType"
                      value="false"
                      checked={!userType}
                      onChange={(e) => setUserType(false)}
                      className="mr-2 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-white">👨‍🎓 Estudiante</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="userType"
                      value="true"
                      checked={userType}
                      onChange={(e) => setUserType(true)}
                      className="mr-2 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-white">👨‍🏫 Profesor</span>
                  </label>
                </div>
              </div>
            </div>
            {error && <div className="text-red-500 text-center">{error}</div>}
            <div>
              <button
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                type="submit"
              >
                Crear
              </button>
            </div>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-700 text-center">
          <span className="text-gray-400">¿Ya tienes cuenta? </span>
          <Link href="/">
            <p className="font-medium text-indigo-500 hover:text-indigo-400 cursor-pointer">
              Iniciar sesión
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
