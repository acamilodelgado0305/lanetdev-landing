import React, { useState, useEffect } from "react";
import { PlusCircle, Wallet, Trash2,Edit } from "lucide-react";
import AddAccountModal from "./addAccount";
import {
  getAccounts,
  deleteAccount,
} from "../../../services/moneymanager/moneyService";
import Swal from "sweetalert2";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const AccountContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cuentas, setCuentas] = useState([]);
  const [error, setError] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [editAccount, setEditAccount] = useState(null);

  const openModal = () => {
    setEditAccount(null);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const fetchCuentas = async () => {
    try {
      const data = await getAccounts();
      setCuentas(data);
      const total = data.reduce(
        (sum, cuenta) => sum + parseFloat(cuenta.balance || 0),
        0
      );
      setTotalBalance(total);
    } catch (err) {
      setError("Error al cargar las cuentas");
      console.error("Error fetching accounts:", err);
    }
  };

  useEffect(() => {
    fetchCuentas();
  }, []);

  const handleAccountAdded = () => {
    fetchCuentas();
  };

  const handleDeleteAccount = async (accountId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar!",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteAccount(accountId);
          await fetchCuentas();
          Swal.fire("Eliminada!", "La cuenta ha sido eliminada.", "success");
        } catch (error) {
          console.error("Error deleting account:", error);
          Swal.fire("Error!", "No se pudo eliminar la cuenta.", "error");
        }
      }
    });
  };

  const openEditModal = (category) => {
    setEditAccount(category);
    setIsModalOpen(true);
  };

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="h-[auto] bg-gray-100 min-h-screen w-full p-4">
      <main className="max-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <h1 className="text-3xl font-bold mb-6 text-indigo-600">
            Dashboard de Cuentas
          </h1>

          <div className="bg-indigo-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-1">Balance Total</p>
            <p className="text-2xl font-bold text-indigo-600">
              {formatCurrency(totalBalance)}
            </p>
          </div>

          <div className="space-y-4 max-h-[40rem] overflow-y-auto">
            {cuentas.map((cuenta) => (
              <div
                key={cuenta.id}
                className="bg-white shadow rounded-lg p-4 flex justify-between items-center hover:shadow-md transition duration-300"
              >
                <div className="flex items-center">
                  <Wallet className="text-indigo-500 mr-3" size={24} />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {cuenta.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {cuenta.type || "Cuenta"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div
                    className={`text-right ${
                      parseFloat(cuenta.balance) >= 0
                        ? "text-green-600"
                        : "text-red-500"
                    } font-bold text-xl mr-4`}
                  >
                    {cuenta.balance !== null && cuenta.balance !== undefined
                      ? formatCurrency(parseFloat(cuenta.balance))
                      : "No disponible"}
                  </div>
                  <button
                    onClick={() => openEditModal(cuenta)}
                    className="text-blue-500 hover:text-blue-700 transition-colors duration-300"
                    aria-label="Editar cuenta"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(cuenta.id)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-300"
                    aria-label="Eliminar cuenta"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={openModal}
            className="fixed bottom-8 right-8 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-4 shadow-lg transition-colors duration-300"
            aria-label="Añadir cuenta"
          >
            <PlusCircle size={24} />
          </button>
          <AddAccountModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onAccountAdded={handleAccountAdded}
            accountToEdit={editAccount}
          />
        </div>
      </main>
    </div>
  );
};

export default AccountContent;
