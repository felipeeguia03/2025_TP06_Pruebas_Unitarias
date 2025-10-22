"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { login } from '../utils/axios'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const loginRequest = { email, password };
      const token = await login(loginRequest);
      console.log("Login successful, token: ", token);
      setIsLoggedIn(true);
      window.location.href = '/home'; 
    } catch (error) {
      setError('Hubo un error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
  };

  return (
    <div className="max-w-lg w-full">
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-center text-3xl font-extrabold text-white">
            Bienvenido a EMARVE!
          </h2>
          <p className="mt-4 text-center text-gray-400">Ingresa para acceder a los mejores cursos</p>
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm">
              <div>
                <label className="sr-only" htmlFor="email">Email</label>
                <input
                  placeholder="Email"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required={true}
                  autoComplete="email"
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                /> 
              </div>
              <div className="mt-4">
                <label className="sr-only" htmlFor="password">Contraseña</label>
                <input
                  placeholder="Contraseña"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  required={true}
                  autoComplete="current-password"
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <div className="text-red-500 text-center">{error}</div>}
            <div>
              <button
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                type="submit"
              >
                Ingresa
              </button>
            </div>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-700 text-center">
          <span className="text-gray-400">¿No tienes cuenta? </span>
          <Link href="/register">
            <p className="font-medium text-indigo-500 hover:text-indigo-400 cursor-pointer">
              Crear cuenta nueva
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;