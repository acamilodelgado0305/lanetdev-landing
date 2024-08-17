import React, { useState, useEffect, useMemo } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import UserProfileHeader from './user/UserProfileHeader';


// Componente SidebarLink
const SidebarLink = ({ to, icon: Icon, children }) => (
  <Link
    to={to}
    className="flex items-center p-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
  >
    <Icon className="w-5 h-5 mr-3 text-gray-500" />
    <span>{children}</span>
  </Link>
);


// Componente SidebarSection
const SidebarSection = ({ title, children }) => (
  <div className="mb-4">
    <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase">{title}</h3>
    {children}
  </div>
);

export default function Root() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigate();


  const userName = 'Juan Pérez';
  const profilePicUrl = 'https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg'; // Aquí deberías colocar la URL real de la imagen
  // Función de logout
  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Obtener nombre de usuario
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (response.ok) {
          const { name } = await response.json();
          setName(name);
        } else {
          console.error("Error al obtener el nombre del usuario");
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
      }
    };
    fetchUserName();
  }, []);

  // Sidebar links (usando useMemo para evitar renders innecesarios)
  const sidebarLinks = useMemo(
    () => [
      { to: "/index", label: "Dashboard" },
      { to: "/index/new", label: "Finanzas" },
      { to: "/index/clientes", label: "Clientes" },
      { to: "/productos", label: "Productos" },
      { to: "/index/doc", label: "Documentación" },
      { to: "/index/moneymanager", label: "Money Manager" },
    ],
    []
  );

  return (
    <div className="flex h-screen ">
      {/* Sidebar */}
      <aside
        className={`${isOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div>
          <UserProfileHeader
            name={userName}
            profilePictureUrl={profilePicUrl}
            onToggle={() => setIsOpen(false)}
          />
        </div>

        <nav className="px-4 py-4">
          <SidebarSection title="Menú principal">
            {sidebarLinks.slice(0, 4).map((link) => (
              <SidebarLink key={link.to} to={link.to} icon={Menu}>
                {link.label}
              </SidebarLink>
            ))}
          </SidebarSection>
          <SidebarSection title="Recursos">
            {sidebarLinks.slice(4).map((link) => (
              <SidebarLink key={link.to} to={link.to} icon={Menu}>
                {link.label}
              </SidebarLink>
            ))}
          </SidebarSection>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4  border-b border-gray-200">
          <button
            onClick={() => setIsOpen(true)}
            className="p-1 text-gray-600 rounded-md lg:hidden hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>

        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 w-full">
          <div className="">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
