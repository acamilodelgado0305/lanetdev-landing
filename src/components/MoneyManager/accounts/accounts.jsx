import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Wallet,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
  const [showPrestamos, setShowPrestamos] = useState(false);
  const [categoryTotals, setCategoryTotals] = useState({
    efectivo: 0,
    banco: 0,
    prestamos: 0,
  });

  const openModal = () => {
    setEditAccount(null);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const fetchCuentas = async () => {
    try {
      const data = await getAccounts();
      setCuentas(data);
      calculateTotals(data);
    } catch (err) {
      setError("Error al cargar las cuentas");
      console.error("Error fetching accounts:", err);
    }
  };

  const calculateTotals = (accounts) => {
    const totals = accounts.reduce(
      (acc, cuenta) => {
        const balance = parseFloat(cuenta.balance || 0);
        if (cuenta.plus) {
          acc.total += balance;
          switch (cuenta.type) {
            case "Dinero en Efectivo":
              acc.efectivo += balance;
              break;
            case "Banco":
              acc.banco += balance;
              break;
          }
        }
        // Always sum prestamos, regardless of the 'plus' flag
        if (cuenta.type === "Prestamos") {
          acc.prestamos += balance;
        }
        return acc;
      },
      { total: 0, efectivo: 0, banco: 0, prestamos: 0 }
    );

    setTotalBalance(totals.total);
    setCategoryTotals({
      efectivo: totals.efectivo,
      banco: totals.banco,
      prestamos: totals.prestamos,
    });
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

  const openEditModal = (account) => {
    setEditAccount(account);
    setIsModalOpen(true);
  };

  const renderAccountSection = (title, accounts, totalAmount) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-indigo-600">{title}</h2>
        <p className="text-lg font-semibold text-green-600">
          {formatCurrency(totalAmount)}
        </p>
      </div>
      <div className="space-y-4">
        {accounts.map((cuenta) => (
          <div
            key={cuenta.id}
            className={`bg-white shadow rounded-lg p-4 flex justify-between items-center hover:shadow-md transition duration-300 ${!cuenta.plus ? "opacity-70" : ""
              }`}
          >
            <div className="flex items-center">
              <Wallet className="text-indigo-500 mr-3" size={24} />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {cuenta.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {cuenta.type || "Cuenta"}
                </p>
                {!cuenta.plus && (
                  <p className="text-xs text-red-500">No se suma al total</p>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <div
                className={`text-right ${parseFloat(cuenta.balance) >= 0
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
    </div>
  );

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  const efectivoCuentas = cuentas.filter(
    (cuenta) => cuenta.type === "Dinero en Efectivo"
  );
  const bancoCuentas = cuentas.filter((cuenta) => cuenta.type === "Banco");
  const prestamoCuentas = cuentas.filter(
    (cuenta) => cuenta.type === "Prestamos"
  );

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

          <div className="space-y-4 max-h-[auto] overflow-y-auto">
            {renderAccountSection(
              "Dinero en Efectivo",
              efectivoCuentas,
              categoryTotals.efectivo
            )}
            {renderAccountSection("Bancos", bancoCuentas, categoryTotals.banco)}

            <div className="mb-8">
              <button
                onClick={() => setShowPrestamos(!showPrestamos)}
                className="flex items-center text-2xl font-bold text-indigo-600 mb-4"
              >
                Préstamos
                {showPrestamos ? (
                  <ChevronUp className="ml-2" />
                ) : (
                  <ChevronDown className="ml-2" />
                )}
              </button>
              {showPrestamos && (
                <>
                  {renderAccountSection("", prestamoCuentas, categoryTotals.prestamos)}
                </>
              )}
            </div>
          </div>

          <button
            onClick={openModal}
            className="fixed bottom-11 right-11 bg-[#FE6256] hover:bg-[#FFA38E] text-white rounded-full p-3 shadow-lg transition-colors duration-300"
            aria-label="Añadir entrada"
          >
            <PlusCircle size={30} />
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
