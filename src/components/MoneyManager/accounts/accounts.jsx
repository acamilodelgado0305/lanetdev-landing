import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BsPlusCircleFill } from "react-icons/bs";
import AddAccountModal from './addAccount';

const AccountContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const [cuentas, setCuentas] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCuentas = async () => {
      try {
        const response = await axios.get('https://ms-finanzas.app.la-net.co/api/accounts');
        setCuentas(response.data);
      } catch (err) {
        setError('Error al cargar las cuentas');
        console.error('Error fetching accounts:', err);
      }
    };

    fetchCuentas();
  }, []);

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-start text-indigo-600">Dashboard de Cuentas</h1>
      <div className="space-y-4">
        {cuentas.map((cuenta) => (
          <div key={cuenta.id} className="bg-white shadow-lg rounded-lg p-4 flex justify-between items-center hover:shadow-xl transition duration-300">
            <div className="flex-grow">
              <h2 className="text-xl text-start font-semibold text-gray-800">{cuenta.name}</h2>
            </div>
            <div className={`text-right ${cuenta.balance ? 'text-green-600' : 'text-red-500'} font-bold text-xl`}>
              {cuenta.balance 
                ? `$${parseFloat(cuenta.balance).toFixed(2)}`
                : 'No disponible'
              }
            </div>
          </div>
        ))}
        <div className="w-[90%] flex justify-end items-end">
            <button
              onClick={openModal}
              className="text-blue-500 hover:text-blue-600 focus:outline-none"
              aria-label="Añadir entrada"
            >
              <BsPlusCircleFill color="red" size={50} />
            </button>
            <AddAccountModal isOpen={isModalOpen} onClose={closeModal} />
          </div>
      </div>
    </div>
  );
};

export default AccountContent;