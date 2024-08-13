import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { BsCart, BsBarChartFill, BsPersonCheckFill, BsBox, BsPersonXFill } from "react-icons/bs";
import { IoPersonOutline } from "react-icons/io5";

export default function Root() {
  const [showOptionsPerfil, setShowOptionsPerfil] = useState(false);
  const [showOptionsEmpleados, setShowOptionsEmpleados] = useState(false);
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      navigate("/");
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const content = await response.json();
          setName(content.name);
        } else {
          console.error("Error al obtener el nombre del usuario");
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
      }
    };

    fetchUserName();
  }, []);

  const toggleOptionsPerfil = () => {
    setShowOptionsPerfil(prev => !prev);
  };

  const toggleOptionsEmpleados = () => {
    setShowOptionsEmpleados(prev => !prev);
  };

  return (
    <div className="flex h-screen ">
      {/* Sidebar */}
      <aside className=" bg-black w-80 text-white p-6">
        <div className="mb-6">
          <div
            className="flex items-center p-4 cursor-pointer hover:bg-gray-700 rounded-lg"
            onClick={toggleOptionsPerfil}
          >
            <IoPersonOutline className="text-3xl mr-3" />
            <span className="text-xl font-medium">{name}</span>
          </div>
          {showOptionsPerfil && (
            <ul className="mt-4 pl-6 space-y-2">
              <li>
                <Link to="/empleados/opcion1" className="block py-3 px-6 hover:bg-gray-700 rounded-lg text-lg">Mi perfil</Link>
              </li>
              <li>
                <button onClick={logout} className="w-full text-left py-3 px-6 hover:bg-gray-700 rounded-lg text-lg">Cerrar Sesión</button>
              </li>
            </ul>
          )}
        </div>

        <nav className="">
          <ul>
            <li className="mb-4">
              <Link to="/index" className="flex items-center p-4 text-white hover:bg-gray-700 rounded-lg text-lg">
                <BsBarChartFill className="text-2xl mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/index/new" className="flex items-center p-4 text-white hover:bg-gray-700 rounded-lg text-lg">
                <BsCart className="text-2xl mr-3" />
                <span>Finanzas</span>
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/index/clientes" className="flex items-center p-4 text-white hover:bg-gray-700 rounded-lg text-lg">
                <BsPersonCheckFill className="text-2xl mr-3" />
                <span>Clientes</span>
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/productos" className="flex items-center p-4 text-white hover:bg-gray-700 rounded-lg text-lg">
                <BsBox className="text-2xl mr-3" />
                <span>Productos</span>
              </Link>
            </li>
            <li className="mb-4">
              <div
                className="flex items-center p-4 cursor-pointer text-white hover:bg-gray-700 rounded-lg text-lg"
                onClick={toggleOptionsEmpleados}
              >
                <BsPersonXFill className="text-2xl mr-3" />
                <span>Empleados</span>
              </div>
              {showOptionsEmpleados && (
                <ul className="mt-4 pl-6 space-y-2">
                  <li>
                    <Link to="/empleados/opcion1" className="block py-3 px-6 hover:bg-gray-700 rounded-lg text-lg">Opción 1</Link>
                  </li>
                  <li>
                    <Link to="/empleados/opcion2" className="block py-3 px-6 hover:bg-gray-700 rounded-lg text-lg">Opción 2</Link>
                  </li>
                </ul>
              )}
            </li>
            <li className="mb-4">
              {/* Placeholder for additional content */}
            </li>
            <li>
              <Link to="/index/doc" className="flex items-center p-4 text-white hover:bg-gray-700 rounded-lg text-lg">
                <BsBox className="text-2xl mr-3" />
                <span>Documentación</span>

              </Link>
            </li>

            <li>
              <Link to="/index/moneymanager" className="flex items-center p-4 text-white hover:bg-gray-700 rounded-lg text-lg">
                <BsBox className="text-2xl mr-3" />
                <span>Money Manager</span>

              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
